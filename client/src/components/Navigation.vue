<script setup lang="ts">
// No props needed for this simple navigation
</script>

<template>
  <nav class="navigation">
    <div class="nav-container">
      <router-link to="/requester" class="nav-item">
        <span class="icon">👤</span>
        <span>Requester</span>
      </router-link>
      <router-link to="/validator" class="nav-item">
        <span class="icon">✓</span>
        <span>Validator</span>
      </router-link>
    </div>
  </nav>
</template>

<style scoped>
.navigation {
  margin-bottom: 2rem;
}

.nav-container {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border-radius: 4px;
  text-decoration: none;
  color: #2c3e50;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.nav-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.nav-item.router-link-active {
  background: #42b983;
  color: white;
}

.icon {
  font-size: 1.25rem;
}
</style>
