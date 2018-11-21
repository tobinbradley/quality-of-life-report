<template>
  <div>
    <Category :category="Character" :config=config :data=data />
    <Category :category="Economy" :config=config :data=data />
    <Category :category="Environment" :config=config :data=data />
    <Category :category="Education" :config=config :data=data />
    <Category :category="Engagement" :config=config :data=data />
    <Category :category="Health" :config=config :data=data />
    <Category :category="Housing" :config=config :data=data />
  </div>
</template>

<script>
import Category from './category'
import data from '../assets/data.json'
import config from '../../data/config/data.json'

export default {
  components: {
    Category: Category
  },
  data: function() {
    return {
      data: data,
      config: config
    };
  },
}
</script>
