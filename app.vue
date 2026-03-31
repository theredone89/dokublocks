<template>
  <NuxtPage v-slot="{ Component, route }">
    <component :is="Component" v-bind="$attrs" />
  </NuxtPage>
</template>
