<template>
  <div>
    <PostList
      :postType="latestPosts"
      :isLoading="isLoading"
      :nextPage="nextPage"
      :postURL="postURL"
      :sessionKey="sessionKey"
    />
  </div>
</template>

<script>
import PostList from "@/components/PostList";
import api from "@/services/api";
import { clearSession } from "@/mixins/utility";

export default {
  components: {
    PostList,
  },
  mixins: [clearSession],

  data() {
    return {
      page: 1,
      latestPosts: [],
      isLoading: true,
      nextPage: false,
      postURL: "/posts/",
      sessionKey: "infinitePage_latest",
    };
  },
  async mounted() {
    if (sessionStorage.getItem(this.sessionKey)) {
      const page_infinite = sessionStorage.getItem(this.sessionKey);
      for (let i = 1; i <= page_infinite; i++) {
        await api
          .get(this.postURL, {
            params: {
              page: i,
            },
          })
          .then(({ data }) => {
            if (data.next !== null) {
              this.nextPage = true;
            } else {
              this.nextPage = false;
            }
            this.latestPosts.push(...data.results);
          });
      }
      this.isLoading = false;
    } else {
      this.clearSession()
      this.getPosts();
    }
  },
  methods: {
    async getPosts() {
      await api.get(this.postURL).then((response) => {
        this.latestPosts = response.data.results;
        if (response.data.next !== null) {
          this.nextPage = true;
        } else {
          this.nextPage = false;
        }
      });
      this.isLoading = false;
    },
  },
};
</script>
