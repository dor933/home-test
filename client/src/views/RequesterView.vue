<template>
  <div class="requester-container">
    <h1>Submit Vacation Request</h1>

    <!-- Vacation Request Form -->
    <div class="form-container">
      <form @submit.prevent="submitRequest">
        <div class="form-group">
          <label for="user-select">Employee:</label>
          <select
            v-model="formData.userEmail"
            id="user-select"
            required
            :disabled="loadingUsers"
          >
            <option value="">
              {{ loadingUsers ? "Loading employees..." : "Select Employee" }}
            </option>
            <option
              v-for="user in requesters"
              :key="user.email"
              :value="user.email"
            >
              {{ user.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="start-date">Start Date:</label>
          <input
            type="date"
            id="start-date"
            v-model="formData.startDate"
            required
          />
        </div>

        <div class="form-group">
          <label for="end-date">End Date:</label>
          <input
            type="date"
            id="end-date"
            v-model="formData.endDate"
            required
          />
        </div>

        <div class="form-group">
          <label for="reason">Reason (Optional):</label>
          <textarea
            id="reason"
            v-model="formData.reason"
            rows="4"
            placeholder="Enter reason for vacation..."
          ></textarea>
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? "Submitting..." : "Submit Request" }}
        </button>
      </form>

      <div v-if="message" :class="['message', message.type]">
        {{ message.text }}
      </div>
    </div>

    <!-- Request History -->
    <div class="history-container">
      <h2>My Requests</h2>

      <div v-if="loadingRequests" class="loading">Loading requests...</div>

      <div v-else-if="requests.length === 0" class="empty-state">
        No vacation requests found
      </div>

      <table v-else class="requests-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Comments</th>
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in requests" :key="request.user?.email">
            <td>{{ request.user?.name }}</td>
            <td>{{ formatDate(request.startDate) }}</td>
            <td>{{ formatDate(request.endDate) }}</td>
            <td>{{ request.reason || "-" }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(request.status)]">
                {{ request.status }}
              </span>
            </td>
            <td>{{ request.comments || "-" }}</td>
            <td>{{ formatDateTime(request.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { vacationRequestsAPI } from "../api/vacationRequests";
import { usersAPI } from "../api/users";
import type { VacationRequest, User, CreateVacationRequest } from "../types";
import { z } from "zod";

const vacationRequestSchema = z
  .object({
    userEmail: z.string().email("Please select a valid employee"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    reason: z.string().optional(),
  })
  .refine(
    (data) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(data.startDate);
      return start >= today;
    },
    {
      message: "Start date cannot be in the past",
      path: ["startDate"],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end > start;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

const formData = ref<CreateVacationRequest>({
  userEmail: "",
  startDate: "",
  endDate: "",
  reason: "",
});

const requests = ref<VacationRequest[]>([]);
const requesters = ref<User[]>([]);
const loading = ref(false);
const loadingRequests = ref(false);
const loadingUsers = ref(false);
const message = ref<{ text: string; type: "success" | "error" } | null>(null);

const submitRequest = async () => {
  loading.value = true;
  message.value = null;

  try {
    // Validate form data with Zod
    const validationResult = vacationRequestSchema.safeParse(formData.value);

    if (!validationResult.success) {
      // Display validation errors
      const errors = validationResult.error.issues;
      message.value = {
        text: errors.map((err) => err.message).join(", "),
        type: "error",
      };
      loading.value = false;
      return;
    }

    const response = await vacationRequestsAPI.create(formData.value);

    if (response.success) {
      message.value = {
        text: response.message || "Request submitted successfully!",
        type: "success",
      };

      // Reset form (keep employee selected)
      const selectedEmployee = formData.value.userEmail;
      formData.value = {
        userEmail: selectedEmployee,
        startDate: "",
        endDate: "",
        reason: "",
      };

      // Reload requests
      await loadRequests();
    } else {
      message.value = {
        text: response.error || "Failed to submit request",
        type: "error",
      };
    }
  } catch (error: any) {
    message.value = {
      text: error.response?.data?.error || "Failed to submit request",
      type: "error",
    };
  } finally {
    loading.value = false;
  }
};

const loadRequests = async () => {
  try {
    let response;

    loadingRequests.value = true;
    if (!formData.value.userEmail) {
      response = await vacationRequestsAPI.getAll();
    } else {
      response = await vacationRequestsAPI.getAll({
        userEmail: formData.value.userEmail,
      });
    }

    if (response.success && response.data) {
      requests.value = response.data;
    } else {
      message.value = {
        text: response.error || "Failed to load requests",
        type: "error",
      };
    }
  } catch (error: any) {
    message.value = {
      text: error.response?.data?.error || "Failed to load requests",
      type: "error",
    };
  } finally {
    loadingRequests.value = false;
  }
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};

const getStatusClass = (status: string): string => {
  return status.toLowerCase();
};

const loadUsers = async () => {
  loadingUsers.value = true;

  try {
    const response = await usersAPI.getRequesters();

    if (response.success && response.data) {
      requesters.value = response.data;
    }
  } catch (error: any) {
    message.value = {
      text: error.response?.data?.error || "Failed to load users",
      type: "error",
    };
    console.error("Failed to load users:", error);
  } finally {
    loadingUsers.value = false;
  }
};

onMounted(async () => {
  await loadUsers();
  await loadRequests();
});

// Watch for user selection change
import { watch } from "vue";
watch(
  () => formData.value.userEmail,
  (newUserEmail) => {
    requests.value = [];

    if (newUserEmail) {
      loadRequests();
    }
  }
);
</script>

<style src="./RequesterView.css" scoped></style>
