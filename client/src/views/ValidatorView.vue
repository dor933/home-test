<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { vacationRequestsAPI } from "../api/vacationRequests";
import type { VacationRequest } from "../types";

const requests = ref<VacationRequest[]>([]);
const statusFilter = ref("");
const loading = ref(false);
const showModal = ref(false);
const selectedRequest = ref<VacationRequest | null>(null);
const modalAction = ref<"Approved" | "Rejected">("Approved");
const modalComments = ref("");
const processingRequest = ref(false);
const modalMessage = ref<{ text: string; type: "success" | "error" } | null>(
  null
);

const stats = computed(() => {
  return {
    pending: requests.value.filter((r) => r.status === "Pending").length,
    approved: requests.value.filter((r) => r.status === "Approved").length,
    rejected: requests.value.filter((r) => r.status === "Rejected").length,
  };
});

const loadRequests = async () => {
  loading.value = true;

  try {
    const params: { status?: string } = {};
    if (statusFilter.value) {
      params.status = statusFilter.value;
    }

    const response = await vacationRequestsAPI.getAll(params);

    if (response.success && response.data) {
      requests.value = response.data;
    }
  } catch (error) {
    console.error("Failed to load requests:", error);
  } finally {
    loading.value = false;
  }
};

const openApproveModal = (request: VacationRequest) => {
  selectedRequest.value = request;
  modalAction.value = "Approved";
  modalComments.value = "";
  modalMessage.value = null;
  showModal.value = true;
};

const openRejectModal = (request: VacationRequest) => {
  selectedRequest.value = request;
  modalAction.value = "Rejected";
  modalComments.value = "";
  modalMessage.value = null;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedRequest.value = null;
  modalComments.value = "";
  modalMessage.value = null;
};

const processRequest = async () => {
  if (!selectedRequest.value) return;

  processingRequest.value = true;
  modalMessage.value = null;

  try {
    const response = await vacationRequestsAPI.handleRequest({
      userEmail: selectedRequest.value.user?.email || "",
      startDate: selectedRequest.value.startDate,
      endDate: selectedRequest.value.endDate,
      reason: modalComments.value || undefined,
      comments: modalComments.value || undefined,
      status: modalAction.value,
    });

    if (response.success) {
      modalMessage.value = {
        text: `Request ${modalAction.value.toLowerCase()} successfully!`,
        type: "success",
      };

      // Reload requests after short delay
      setTimeout(async () => {
        await loadRequests();
        closeModal();
      }, 1000);
    } else {
      modalMessage.value = {
        text: response.error || "Failed to process request",
        type: "error",
      };
    }
  } catch (error: any) {
    modalMessage.value = {
      text: error.response?.data?.error || "Failed to process request",
      type: "error",
    };
  } finally {
    processingRequest.value = false;
  }
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};

const calculateDays = (start: string, end: string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

const getStatusClass = (status: string): string => {
  return status.toLowerCase();
};

onMounted(() => {
  loadRequests();
});
</script>

<template>
  <div class="validator-container">
    <h1>Vacation Request Dashboard</h1>

    <!-- Filter Controls -->
    <div class="filter-container">
      <div class="filter-group">
        <label for="status-filter">Filter by Status:</label>
        <select
          v-model="statusFilter"
          id="status-filter"
          @change="loadRequests"
        >
          <option value="">All Requests</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div class="stats">
        <div class="stat-card">
          <div class="stat-value">{{ stats.pending }}</div>
          <div class="stat-label">Pending</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.approved }}</div>
          <div class="stat-label">Approved</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.rejected }}</div>
          <div class="stat-label">Rejected</div>
        </div>
      </div>
    </div>

    <!-- Requests Table -->
    <div class="table-container">
      <div v-if="loading" class="loading">Loading requests...</div>

      <div v-else-if="requests.length === 0" class="empty-state">
        No vacation requests found
      </div>

      <table v-else class="requests-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Days</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Submitted</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in requests" :key="request.user?.email">
            <td>{{ request.user?.name || "Unknown" }}</td>
            <td>{{ formatDate(request.startDate) }}</td>
            <td>{{ formatDate(request.endDate) }}</td>
            <td>{{ calculateDays(request.startDate, request.endDate) }}</td>
            <td>{{ request.reason || "-" }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(request.status)]">
                {{ request.status }}
              </span>
            </td>
            <td>{{ formatDateTime(request.createdAt) }}</td>
            <td>
              <div v-if="request.status === 'Pending'" class="action-buttons">
                <button
                  @click="openApproveModal(request)"
                  class="btn-approve"
                  title="Approve"
                >
                  ✓ Approve
                </button>
                <button
                  @click="openRejectModal(request)"
                  class="btn-reject"
                  title="Reject"
                >
                  ✗ Reject
                </button>
              </div>
              <span v-else class="processed">Processed</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Approve/Reject Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h3>{{ modalAction === "Approved" ? "Approve" : "Reject" }} Request</h3>

        <div class="modal-details">
          <p><strong>Employee:</strong> {{ selectedRequest?.user?.name }}</p>
          <p>
            <strong>Dates:</strong>
            {{ formatDate(selectedRequest?.startDate || "") }} -
            {{ formatDate(selectedRequest?.endDate || "") }}
          </p>
          <p>
            <strong>Reason:</strong>
            {{ selectedRequest?.reason || "No reason provided" }}
          </p>
        </div>

        <div class="form-group">
          <label for="comments">Comments:</label>
          <textarea
            id="comments"
            v-model="modalComments"
            rows="4"
            :placeholder="
              modalAction === 'Approved'
                ? 'Optional approval message...'
                : 'Rejection reason...'
            "
          ></textarea>
        </div>

        <div class="modal-actions">
          <button @click="closeModal" class="btn-secondary">Cancel</button>
          <button
            @click="processRequest"
            :class="[
              'btn-primary',
              modalAction === 'Rejected' ? 'btn-danger' : '',
            ]"
            :disabled="processingRequest"
          >
            {{
              processingRequest
                ? "Processing..."
                : modalAction === "Approved"
                ? "Approve"
                : "Reject"
            }}
          </button>
        </div>

        <div v-if="modalMessage" :class="['message', modalMessage.type]">
          {{ modalMessage.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<style src="./ValidatorView.css" scoped></style>
