<template>
  <div class="h-100 d-flex align-center justify-md-space-between justify-center">
    <!-- 👉 Footer: left content -->
    <span class="d-flex align-center text-medium-emphasis">
      &copy;
      {{ new Date().getFullYear() }}
      Made With
      <VIcon
        icon="tabler-heart-filled"
        color="error"
        size="1.25rem"
        class="mx-1"
      />
      By <a
        href="https://arispay.co.ke"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary ms-1"
      >arisPay</a>
    </span>
    <!-- 👉 Footer: right content -->
    <span class="d-md-flex gap-x-4 text-primary d-none">
      <a
        href="https://arispay.co.ke/contact"
        target="noopener noreferrer"
      >Support</a>
    </span>
  </div>
</template>
