<template>
  <div>
    <Category category="Character" :config=config :data=data :site=site />
    <Category category="Economy" :config=config :data=data :site=site />
    <Category category="Environment" :config=config :data=data :site=site />
    <Category category="Education" :config=config :data=data :site=site />
    <Category category="Engagement" :config=config :data=data :site=site />
    <Category category="Health" :config=config :data=data :site=site />
    <Category category="Housing" :config=config :data=data :site=site />
    <Category category="Safety" :config=config :data=data :site=site />
    <Category category="Transportation" :config=config :data=data :site=site />
  </div>
</template>

<script>
import Category from './category'
import data from '../assets/data.json'
import config from '../../data/config/data.json'
import site from '../../data/config/site.json'

export default {
  components: {
    Category: Category
  },
  data: function() {
    return {
      data: data,
      config: config,
      site: site
    };
  },
}
</script>
