<template>
  <div class="container">
    <div v-if="!osuPath" class="hero bg-base-200 min-h-screen min-w-screen">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <h1 class="text-3xl font-bold">Osu! Map Pack Creator</h1>
          <p class="py-4"></p>
          <button class="btn btn-primary btn-outline" @click="selectOsuPath">Choose beatmap folder</button>
        </div>
      </div>
    </div>

    <div v-else class="flex w-full h-full p-4 gap-4">
      <div class="flex flex-col flex-[8] h-full">
        <div class="flex justify-between items-center mb-4">
          <label class="input input-sm flex items-center gap-2 w-full">
            <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input v-model="searchQuery" type="search" class="grow" placeholder="Search" />
          </label>
          <button class="btn btn-sm ml-2" @click="refreshBeatmaps">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
            </svg>
            Refresh available beatmaps
          </button>
        </div>

        <DualList v-model="selectedBeatmaps" :items="filteredBeatmaps" class="flex-1" />
      </div>
      <div class="flex flex-col flex-[2] h-full">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body space-y-4">
            <h2 class="card-title">Metadata</h2>
            <fieldset class="fieldset flex flex-col gap-2">
              <legend class="fieldset-legend">Map pack title</legend>
              <input v-model="mapsetName" type="text" class="input input-xs" placeholder="Type here" />
              <legend class="fieldset-legend">Artist</legend>
              <input v-model="artistName" type="text" class="input input-xs" placeholder="Type here" />
              <legend class="fieldset-legend">Creator</legend>
              <input v-model="mapsetCreator" type="text" class="input input-xs" placeholder="Type here" />
              <label class="label cursor-pointer">
                <span class="label-text">add delete</span>
                <input v-model="includeStaticFiles" type="checkbox" class="checkbox checkbox-sm" />
              </label>
            </fieldset>
            <div class="justify-end card-actions">
              <button class="btn btn-primary btn-outline btn-sm" @click="createMapset">Create map pack</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DualList from './components/dualList.vue'

const osuPath = ref('')
const beatmaps = ref([]) // 所有的 beatmaps
const selectedBeatmaps = ref([]) // 已选中的 beatmaps
const searchQuery = ref('') // 搜索查询
const mapsetName = ref('')
const artistName = ref('Various Artists')
const mapsetCreator = ref('')
const includeStaticFiles = ref(false)

// 过滤后的 beatmaps
const filteredBeatmaps = computed(() => {
  const query = searchQuery.value.toLowerCase()
  if (!query) return beatmaps.value

  return beatmaps.value.filter((beatmap) => {
    const { title, creator, version } = beatmap.metadata
    return (
      (title && title.toLowerCase().includes(query)) ||
      (creator && creator.toLowerCase().includes(query)) ||
      (version && version.toLowerCase().includes(query))
    )
  })
})

const selectOsuPath = async () => {
  osuPath.value = await window.api.selectOsuPath()
  beatmaps.value = await window.api.loadOsuFiles(osuPath.value)
}

const refreshBeatmaps = async () => {
  if (!osuPath.value) return
  beatmaps.value = await window.api.loadOsuFiles(osuPath.value)
}

const createMapset = async () => {
  if (!mapsetName.value) {
    alert('Please input mapset title')
    return
  }
  if (selectedBeatmaps.value.length === 0) {
    alert('Please choose at least one map')
    return
  }

  try {
    const safeSelectedBeatmaps = JSON.parse(JSON.stringify(selectedBeatmaps.value))
    await window.api.createMapset({
      osuPath: osuPath.value,
      selectedBeatmaps: safeSelectedBeatmaps,
      options: {
        mapsetName: mapsetName.value,
        artistName: artistName.value || 'Various Artists',
        mapsetCreator: mapsetCreator.value || 'osu!mapPackCreator',
        includeStaticFiles: includeStaticFiles.value
      }
    })
    alert(`Create succeeded!`)
  } catch (error) {
    alert(`Create failed: ${error.message}`)
  }
}
</script>
