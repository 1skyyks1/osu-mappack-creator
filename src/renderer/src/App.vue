<template>
  <div class="container">
    <div v-if="!osuPath" class="hero bg-base-200 min-h-screen min-w-screen">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <h1 class="text-3xl font-bold">Osu! Map Pack Creator</h1>
          <p class="py-4"></p>
          <button class="btn btn-primary btn-outline" @click="selectOsuPath">
            Choose beatmap folder
          </button>
        </div>
      </div>
    </div>

    <div v-else class="flex w-full h-full p-4 gap-4">
      <div class="flex flex-col flex-[8] h-full">
        <div class="flex justify-between items-center mb-4">
          <label class="input input-sm flex items-center gap-2 w-full">
            <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g
                stroke-linejoin="round"
                stroke-linecap="round"
                stroke-width="2.5"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input v-model="searchQuery" type="search" class="grow" placeholder="Search" />
          </label>
          <button class="btn btn-sm ml-2 mr-3" @click="refreshBeatmaps">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-arrow-clockwise"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"
              />
              <path
                d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"
              />
            </svg>
            Refresh available beatmaps
          </button>
          <label class="swap swap-rotate">
            <input type="checkbox" class="theme-controller" value="dim" />
            <svg
              class="swap-off h-6 w-6 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path
                d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"
              />
            </svg>
            <svg
              class="swap-on h-6 w-6 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path
                d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"
              />
            </svg>
          </label>
        </div>

        <DualList v-model="selectedBeatmaps" :items="filteredBeatmaps" class="flex-1" />
      </div>
      <div class="flex flex-col flex-[2] h-full">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body space-y-4">
            <h2 class="card-title">Metadata</h2>
            <fieldset class="fieldset flex flex-col">
              <legend class="fieldset-legend">Map pack title</legend>
              <input
                v-model="mapsetName"
                type="text"
                class="input input-xs"
                placeholder="Type here"
              />
              <legend class="fieldset-legend">Artist</legend>
              <input
                v-model="artistName"
                type="text"
                class="input input-xs"
                placeholder="Type here"
              />
              <legend class="fieldset-legend">Creator</legend>
              <input
                v-model="mapsetCreator"
                type="text"
                class="input input-xs"
                placeholder="Type here"
              />
              <legend class="fieldset-legend">Overall difficulty(OD)</legend>
              <input
                v-model="od"
                type="number"
                step="0.1"
                class="input input-xs validator"
                min="0"
                max="10"
                placeholder="Type here"
              />
              <legend class="fieldset-legend">HP drain rate(HP)</legend>
              <input
                v-model="hp"
                type="number"
                step="0.1"
                class="input input-xs validator"
                min="0"
                max="10"
                placeholder="Type here"
              />
              <label class="label cursor-pointer">
                <span class="label-text">add delete</span>
                <input v-model="includeStaticFiles" type="checkbox" class="checkbox checkbox-sm" />
              </label>
            </fieldset>
            <div class="justify-end card-actions">
              <button class="btn btn-primary btn-outline btn-sm" @click="createMapset">
                Create map pack
              </button>
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
const od = ref(8)
const hp = ref(8)
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
        od: od.value,
        hp: hp.value,
        includeStaticFiles: includeStaticFiles.value
      }
    })
    alert(`Create succeeded!`)
  } catch (error) {
    alert(`Create failed: ${error.message}`)
  }
}
</script>
