<template>
  <div>
    <v-btn
      class="mx-2 d-none d-sm-flex"
      @click="$router.back()"
      fab
      fixed
      dark
      small
      color="blue-grey lighten-2"
    >
      <v-icon dark> mdi-arrow-left </v-icon>
    </v-btn>
    <v-btn
      class="mx-2 d-flex d-sm-none"
      fab
      large
      fixed
      right
      bottom
      dark
      color="blue-grey lighten-2"
      to="/newpostpage"
    >
      <v-icon dark> mdi-plus </v-icon>
    </v-btn>
    <div class="content">
      <div v-show="isLoading" class="text-center">
        <v-progress-circular
          indeterminate
          color="blue-gray"
        ></v-progress-circular>
      </div>
      <div v-show="!isLoading">
        <v-card class="mb-2" color="blue-grey lighten-5">
          <v-row no-gutters>
            <v-col cols="6" lg="3" md="3" sm="3" xs="3">
              <v-img aspect-ratio="1" eager :src="Person.icon_image"> </v-img>
            </v-col>
            <v-col cols="6" lg="4" md="3" sm="9" xs="3" class="pa-md-3">
              <v-card-title
                v-if="user_id == login_user_id"
                class="text-h5 text-sm-h4 text-md-h4 text-lg-h3 pa-2 pa-sm-4"
              >
                {{ login_user_username }}
                <v-btn
                  v-if="user_id == login_user_id"
                  style="text-decoration: none"
                  fab
                  x-small
                  class="ml-4"
                  color="indigo lighten-4"
                  to="/profile_edit"
                >
                  <v-icon>mdi-account-edit</v-icon>
                </v-btn>
              </v-card-title>
              <v-card-title
                v-else
                class="text-h5 text-sm-h4 text-md-h4 text-lg-h3"
                >{{ Person.username }}</v-card-title
              >
              <v-card-text class="pa-2 pa-sm-4">
                <div v-if="user_id == login_user_id">
                  <div v-if="login_user_introduction === null"></div>
                  <div v-else>{{ login_user_introduction }}</div>
                </div>
                <div v-else>
                  <div v-if="Person.introduction === null"></div>
                  <div v-else>{{ Person.introduction }}</div>
                </div>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  text
                  outlined
                  class="text-caption text-sm-body-2 font-weight-black"
                  @click="dialog1 = true"
                >
                  フォロー
                  {{ Person.followings_count }}
                </v-btn>
                <v-btn
                  text
                  outlined
                  class="text-caption text-sm-body-2 font-weight-black"
                  @click="dialog2 = true"
                >
                  フォロワー
                  {{ followersCount }}
                </v-btn>
                <v-dialog v-model="dialog1" activator max-width="400px">
                  <ConnectionList
                    :connectionList="followList"
                    @closeModal="closeModal"
                  />
                </v-dialog>
                <v-dialog v-model="dialog2" activator max-width="400px">
                  <ConnectionList
                    :connectionList="followerList"
                    @closeModal="closeModal"
                  />
                </v-dialog>
              </v-card-actions>
              <v-card-actions v-if="user_id != login_user_id && isLoggedIn">
                <v-btn
                  v-if="!isFollowing"
                  block
                  class="text-sm-body-1 font-weight-black"
                  @click="toggleFollow()"
                >
                  フォローする
                </v-btn>
                <v-btn
                  v-if="isFollowing"
                  block
                  dark
                  class="text-sm-body-1 font-weight-black"
                  color="blue-grey darken-2"
                  @click="toggleFollow()"
                >
                  フォロー中
                </v-btn>
              </v-card-actions>
            </v-col>
            <v-col cols="12" lg="5" md="6" class="d-none d-md-flex">
              <div v-if="previousPosts[0]" class="chart">
                <div id="piechart">
                  <PieChart
                    v-if="loaded"
                    :data="pieChartData"
                    :options="options"
                    style="position: relative; width: 460px; height: 220px"
                  ></PieChart>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card>
        <v-tabs color="blue-grey lighten-2" centered show-arrows>
          <v-tab :to="{ name: 'mypage', params: { user_id: user_id } }">
            <v-icon left>mdi-history</v-icon>
            <v-badge
              color="blue-grey darken-1"
              :content="previousPostsNum"
              :value="previousPostsNum"
            >
              <span>これまでの投稿</span>
            </v-badge>
          </v-tab>
          <v-tab :to="{ name: 'liked', params: { user_id: user_id } }">
            <v-icon left>mdi-heart</v-icon>
            <v-badge
              color="blue-grey darken-1"
              :content="likedPostsNum"
              :value="likedPostsNum"
            >
              <span>いいねした投稿</span>
            </v-badge>
          </v-tab>
          <v-tab :to="{ name: 'mymap', params: { user_id: user_id } }">
            <v-icon left>mdi-map-marker</v-icon>
            <span>マイマップ</span>
          </v-tab>
        </v-tabs>
        <div class="content">
          <transition appear>
            <router-view @deletePost="get_previous_posts" />
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import PieChart from "@/components/PieChart";
import * as palette from "google-palette";
import api from "@/services/api";
import ConnectionList from "@/components/ConnectionList";

export default {
  components: {
    PieChart,
    ConnectionList,
  },
  props: ["user_id"],
  data() {
    return {
      loaded: false,
      previousPostsNum: 0,
      likedPostsNum: 0,
      // グラフ描画用データ
      pieChartData: {
        // ラベル
        labels: [],
        // データ詳細
        datasets: [
          {
            // label: "藩と人口",
            data: [],
            backgroundColor: palette("mpn65", 30).map(function (hex) {
              return "#" + hex + 30;
            }),
            borderColor: "transparent",
          },
        ],
      },
      // グラフオプション
      options: {
        legend: {
          // 凡例に関する設定
          display: true, // 凡例を表示します。
          position: "right", // 凡例の位置
        },
        animation: { animateRotate: false },
        maintainAspectRatio: false,
      },
      Person: {},
      previousPosts: [],
      login_user_icon_image: this.$store.getters["user/icon_image"],
      login_user_username: this.$store.getters["user/username"],
      login_user_introduction: this.$store.getters["user/introduction"],
      isFollowing: false,
      followersCount: "",
      connectionId: "",
      isProcessing: false,
      isLoading: true,
      followerList: [],
      followList: [],
      dialog1: false,
      dialog2: false,
    };
  },
  computed: {
    ...mapGetters("user", {
      login_user_id: "id",
    }),
    ...mapGetters("category", {
      categories: "categories",
    }),
    isLoggedIn() {
      return this.$store.getters["auth/isLoggedIn"];
    },

    myCategories() {
      return this.previousPosts.map((x) => x.category.id);
    },
    categoriesNum() {
      var categories_num = [];
      for (var i = 1; i < this.categories.length + 1; i++) {
        categories_num.push(this.myCategories.filter((num) => num == i).length);
      }
      return categories_num;
    },
  },

  watch: {
    user_id() {
      console.log("watch!!!!");
      this.setPerson();
      this.loaded = false;
      this.get_previous_posts();
      this.confirmFollowing();
      this.confirmFollower();
      this.confirmFollow();
    },
  },
  created() {
    console.log("created!!!!");
    this.confirmFollowing();
    this.confirmFollower();
    this.confirmFollow();
    this.get_previous_posts();
    this.get_liked_posts();
  },
  async mounted() {
    console.log("mounted!!!!");
    this.setPerson();
    this.confirmFollow();
    const labels = this.categories.map((x) => x.name);
    this.options.animation.animateRotate = true;
    this.pieChartData.labels = labels;
    this.loaded = false;
    await api.get("/posts/mini/?author=" + this.user_id).then((response) => {
      this.previousPosts = response.data;
      this.options.animation.animateRotate = true;
      this.set_category_data();
      this.options.animation.animateRotate = false;
    });
  },
  methods: {
    get_liked_posts() {
      console.log("get_liked_posts!!!!");
      api
        .get("/likes/", {
          params: {
            author: this.user_id,
          },
        })
        .then((response) => {
          this.likedPostsNum = response.data.count;
        });
    },
    get_previous_posts() {
      console.log("get_previous_posts!!!!");
      api.get("/posts/mini/?author=" + this.user_id).then((response) => {
        this.previousPosts = response.data;
        this.set_category_data();
        this.previousPostsNum = response.data.length;
      });
    },
    set_category_data() {
      console.log("set_category_data!!!!");
      this.pieChartData.datasets[0].data = this.categoriesNum;
      this.loaded = true;
    },
    async setPerson() {
      await api.get("/users/" + this.user_id + "/").then((response) => {
        this.Person = response.data;
        this.followersCount = response.data.followers_count;
      });
      this.isLoading = false;
    },
    async confirmFollowing() {
      await api
        .get("/connections/", {
          params: {
            follower: this.user_id,
            following: this.login_user_id,
          },
        })
        .then((response) => {
          console.log("response.data[0]" + response.data[0]);
          if (response.data[0]) {
            console.log("あああ");
            this.isFollowing = true;
            console.log("response.data[0].id" + response.data[0]);
            this.connectionId = response.data[0].id;
          } else {
            this.isFollowing = false;
          }
        });
    },
    async confirmFollower() {
      await api
        .get("/connections/", {
          params: {
            follower: this.user_id,
          },
        })
        .then((response) => {
          if (response.data) {
            this.followerList = response.data.map((user) => user.following);
          }
        });
    },
    async confirmFollow() {
      await api
        .get("/connections/", {
          params: {
            following: this.user_id,
          },
        })
        .then((response) => {
          if (response.data) {
            this.followList = response.data.map((user) => user.follower);
          }
        });
    },
    toggleFollow() {
      this.isProcessing = true;
      this.isFollowing ? this.Unfollow() : this.Follow();
      return new Promise((resolve) => {
        setTimeout(() => {
          this.isProcessing = false;
          resolve();
        }, 500);
      });
    },
    Follow() {
      console.log("----Follow----");
      this.followersCount += 1;
      this.isFollowing = true;
      api
        .post("/connections/", {
          follower_id: this.user_id,
          following_id: this.login_user_id,
        })
        .then((response) => {
          this.connectionId = response.data.id;
          this.confirmFollower();
        });
    },
    Unfollow() {
      console.log("----Unfollow----");
      this.followersCount -= 1;
      this.isFollowing = false;
      api
        .delete("/connections/" + this.connectionId + "/", {
          follower_id: this.user_id,
          following_id: this.login_user_id,
        })
        .then(this.confirmFollower);
    },
    closeModal() {
      this.dialog1 = false;
      this.dialog2 = false;
    },
  },
};
</script>

<style scoped>
@import "../assets/common.css";

.v-tabs {
  border-bottom: 1px solid rgb(223, 211, 211);
}

.v-tabs a {
  text-decoration: none;
}

.v-tab span {
  font-size: 16px;
}

.content {
  margin: 20px auto;
  max-width: 1200px;
  font-size: 20px;
}

.chart {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
</style>
