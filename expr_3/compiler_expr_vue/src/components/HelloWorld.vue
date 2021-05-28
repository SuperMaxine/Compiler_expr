<template>
  <vue3-mermaid
    :nodes="graph"
    type="graph LR"
  ></vue3-mermaid>
</template>

<script>
export default {
  props: ["graph"],
};
</script>

