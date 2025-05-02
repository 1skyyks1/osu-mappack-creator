<template>
  <div class="dual-list-container h-full w-full">
    <div class="card w-full bg-base-100 card-md shadow-sm">
      <div class="card-body h-full">
        <div class="flex gap-4 h-full">
          <div class="flex flex-col flex-1">
            <h2 class="card-title">Available beatmaps</h2>
            <div class="overflow-auto flex-1 max-h-[400px]">
              <table class="table table-xs table-zebra flex-1 table-pin-rows">
                <thead>
                  <tr>
                    <th>Artist - Title[Version]</th>
                    <th>Creator</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in availableItems"
                    :key="item.id"
                    :class="{ disabled: isSelected(item) }"
                  >
                    <td>
                      {{ item.metadata.artist }} - {{ item.metadata.title }} [{{
                        item.metadata.version
                      }}]
                    </td>
                    <td>{{ item.metadata.creator }}</td>
                    <td>
                      <button class="btn btn-square btn-xs" @click="selectItem(item)">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="2.5"
                          stroke="currentColor"
                          class="size-[1.2em]"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="flex flex-col flex-1">
            <h2 class="card-title">Selected beatmaps</h2>
            <div class="overflow-auto flex-1 max-h-[400px]">
              <table class="table table-xs table-zebra flex-1">
                <thead>
                  <tr>
                    <th>Artist - Title[Version]</th>
                    <th>Creator</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in selectedItems" :key="item.id">
                    <td>
                      {{ item.metadata.artist }} - {{ item.metadata.title }} [{{
                        item.metadata.version
                      }}]
                    </td>
                    <td>{{ item.metadata.creator }}</td>
                    <td>
                      <button class="btn btn-square btn-xs" @click="removeItem(item)">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="2.5"
                          stroke="currentColor"
                          class="size-[1.2em]"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: Array,
  modelValue: Array
})

const emit = defineEmits(['update:modelValue'])

const availableItems = computed(() => {
  return props.items.filter((item) => !props.modelValue.includes(item))
})

const selectedItems = computed(() => {
  return props.modelValue
})

const isSelected = (item) => {
  return selectedItems.value.includes(item)
}

const selectItem = (item) => {
  if (!isSelected(item)) {
    emit('update:modelValue', [...selectedItems.value, item])
  }
}

const removeItem = (item) => {
  emit(
    'update:modelValue',
    selectedItems.value.filter((i) => i !== item)
  )
}
</script>
