<template>
  <vue3-mermaid
    :nodes="treeGraph"
    type="graph TD"
    :key="treeGraph"
  ></vue3-mermaid>
</template>

<script>
export default {
  name: "Tree",
  props: ["treeGraph"],
};
</script>

