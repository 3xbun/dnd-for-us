<template>
  <div class="badges">
    <img
      src="https://status.dnd-for.us/api/badge/6/uptime/168?label=(7d)&labelPrefix=Pathum+Wan+&style=for-the-badge"
      alt="Pathum Wan Server Status"
    />
    <img
      src="https://status.dnd-for.us/api/badge/5/uptime/168?label=(7d)&labelPrefix=Rangsit+&style=for-the-badge"
      alt="Rangsit Server Status"
    />
    <img
      src="https://status.dnd-for.us/api/badge/7/uptime/168?label=(7d)&labelPrefix=Sai+Mai+&style=for-the-badge"
      alt="Sai Mai Server Status"
    />
  </div>
</template>

<style lang="css" scoped>
.badges {
  padding-top: 3em;
  display: flex;
  width: 100%;
  gap: 0.5em;
  justify-content: space-between;
}

img {
  width: 30%;
}
</style>
