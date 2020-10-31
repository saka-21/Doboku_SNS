<template>
  <div>
    <div v-show="isLoading" class="text-center">
      <v-progress-circular
        indeterminate
        color="blue-gray"
      ></v-progress-circular>
    </div>
    <div v-show="!isLoading">
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
      <v-row justify="center">
        <v-col justify="center">
          <v-card
            elevation="5"
            shaped
            color="blue-grey lighten-5"
            class="mx-auto"
            max-width="1200px"
          >
            <div class="pa-6">
              <h3 v-if="post_id" class="text-center">投稿編集</h3>
              <h3 v-else class="text-center">新規投稿</h3>
              <ValidationObserver v-slot="{ invalid }">
                <form @submit.prevent="submitPost()">
                  <v-row>
                    <v-col cols="12" md="6">
                      <div uk-form-custom id="form_custom">
                        <div class="uk-placeholder uk-text-center">
                          <input type="file" @change="selectedFile" />
                          <div v-if="!post_id" id="preview">
                            <img
                              id="preview_image"
                              v-show="previewImage"
                              :src="previewImage"
                            />
                          </div>
                          <div v-else id="preview">
                            <img id="preview_image" :src="beforeImage" />
                          </div>
                          <div class="camera-choice">
                            <v-icon size="100">mdi-camera</v-icon>
                            <p>画像を選択してください</p>
                          </div>
                        </div>
                      </div>
                      <p id="error_message">{{ message }}</p>
                    </v-col>
                    <v-col cols="12" md="6">
                      <ValidationProvider
                        mode="lazy"
                        name="カテゴリ"
                        rules="required"
                        v-slot="{ errors }"
                      >
                        <v-select
                          :items="categories"
                          item-text="name"
                          item-value="id"
                          :error-messages="errors"
                          v-model="category"
                          label="カテゴリ"
                          placeholder="選択してください"
                        ></v-select>
                      </ValidationProvider>
                      <ValidationProvider
                        mode="aggressive"
                        name="タイトル"
                        rules="required|max:12"
                        v-slot="{ errors }"
                      >
                        <v-text-field
                          label="タイトル"
                          v-model="title"
                          :counter="12"
                          :error-messages="errors"
                          required
                          placeholder="例）明石海峡大橋"
                          hint=": 12文字以下"
                          persistent-hint
                        ></v-text-field>
                      </ValidationProvider>
                      <ValidationProvider
                        mode="aggressive"
                        name="キャプション"
                        rules="required"
                        v-slot="{ errors }"
                      >
                        <v-textarea
                          label="キャプション"
                          rows="4"
                          :error-messages="errors"
                          v-model="content"
                        ></v-textarea>
                      </ValidationProvider>
                      <div class="uk-inline uk-width-1-1 location_form">
                        <label>場所（任意）</label>
                        <span id="select_way"
                          >: 指定方法は以下の2つのみです</span
                        >
                        <div
                          uk-switcher="animation: uk-animation-fade; toggle: > *"
                        >
                          <v-btn
                          color="light-blue darken-4
"
                          dark
                            :href="'#modal-center' + title"
                            @click="callChildMethod"
                            uk-toggle
                            small
                            style="text-decoration: none;"
                          >
                            タイトルから検索
                          </v-btn>
                          or
                          <v-btn small color="light-blue darken-4
"
                          dark
                          >
                            都道府県のみ
                          </v-btn>
                        </div>
                        <div
                          :id="'modal-center' + title"
                          class="uk-flex-top .uk-width-large"
                          uk-modal
                        >
                          <div
                            class="uk-modal-dialog uk-modal-body uk-margin-auto-vertical"
                          >
                            <button
                              class="uk-modal-close-default"
                              type="button"
                              uk-close
                            ></button>
                            <div>
                              <TitleSearchMap
                                ref="map"
                                :title="title"
                                @callParent="callParent"
                              />
                            </div>
                          </div>
                        </div>
                        <ul class="uk-switcher">
                          <li>
                            <v-text-field
                              placeholder="住所または都道府県名が入力されます"
                              v-model="address"
                            />
                          </li>
                          <li>
                            <v-select v-model="prefecture" placeholder="都道府県を選択してください" :items="prefs" item-text="name" item-value="name" clearable>
                            </v-select>
                          </li>
                        </ul>
                      </div>
                    </v-col>
                  </v-row>
                  <v-btn
                    block
                    large
                    elevation="2"
                    class="mr-4 mt-4"
                    type="submit"
                    :disabled="invalid"
                    color="blue-grey lighten-2"
                  >
                    <span v-if="post_id">
                      <v-icon>mdi-content-save</v-icon>
                      変更を保存
                      </span>
                    <span v-else>
                      <v-icon>mdi-send-outline</v-icon>
                      投稿
                      </span>
                  </v-btn>
                </form>
              </ValidationObserver>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import TitleSearchMap from "@/components/TitleSearchMap";
import prefs from "../mixins/PrefsMixin";
import { mapGetters } from "vuex";
import api from "@/services/api";
import {
  ValidationProvider,
  ValidationObserver,
  extend,
  localize,
} from "vee-validate";
import ja from "vee-validate/dist/locale/ja.json";
import { required, max, min, email, image } from "vee-validate/dist/rules";
import { clearSession } from "@/mixins/utility";

extend("required", required);
extend("max", max);
extend("min", min);
extend("email", email);
extend("image", image);
localize("ja", ja);

export default {
  mixins: [prefs, clearSession],
  components: {
    TitleSearchMap,
    ValidationProvider,
    ValidationObserver,
  },
  props: ["post_id"],
  data() {
    return {
      category: "",
      author_name: this.$store.getters["auth/id"],
      image: null,
      previewImage: null,
      beforeImage: null,
      title: "",
      content: "",
      address: "",
      prefecture: "",
      lat: "",
      lng: "",
      message: "",
      isLoading: true,
    };
  },
  watch: {
    image() {
      if (this.image || this.beforeImage) {
        return (this.message = "");
      }
    },
    $route() {
      (this.category = ""),
        (this.author_name = this.$store.getters["auth/id"]),
        (this.image = null),
        (this.previewImage = null),
        (this.beforeImage = null),
        (this.title = ""),
        (this.content = ""),
        (this.address = ""),
        (this.prefecture = ""),
        (this.lat = ""),
        (this.lng = ""),
        (this.message = "");
    },
  },
  computed: {
    ...mapGetters("category", ["categories"]),
  },
  methods: {
    callChildMethod() {
      this.$refs.map.mapSearch();
    },
    callParent(address, prefecture, lat, lng) {
      this.address = address;
      this.prefecture = prefecture[0].long_name;
      this.lat = lat;
      this.lng = lng;
    },
    selectedFile(event) {
      event.preventDefault();
      this.image = event.target.files[0];
      this.createImage(event.target.files[0]);
    },
    submitPost() {
      const formData = new FormData();
      formData.append("category", this.category);
      formData.append("author_name", this.author_name);
      formData.append("title", this.title);
      formData.append("content", this.content);
      if (this.image) formData.append("raw_image", this.image);
      formData.append("prefecture", this.prefecture);
      if (this.address) formData.append("address", this.address);
      if (this.lat) formData.append("lat", this.lat);
      if (this.lng) formData.append("lng", this.lng);
      if (this.post_id) {
        if (this.image || this.beforeImage) {
          api
            .patch("/posts/" + this.post_id + "/", formData)
            .then((response) => {
              console.log("送信内容: " + response.data);
              this.$router.replace("/");
            });
        } else {
          console.log("エラー");
          this.message = "画像ファイルを選択してください";
        }
      } else {
        if (this.image || this.beforeImage) {
          api.post("/posts/", formData).then((response) => {
            console.log("送信内容: " + response.data);
            this.$router.replace("/");
          });
        } else {
          console.log("エラー");
          this.message = "画像ファイルを選択してください";
        }
      }
    },
    createImage(file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        this.previewImage = event.target.result;
      };
      reader.readAsDataURL(file);
    },
  },
  created() {
    this.clearSession();
    if (this.post_id) {
      console.log("投稿編集");
      api.get("/posts/" + this.post_id + "/").then((response) => {
        this.beforeImage = response.data.image;
        this.category = response.data.category;
        this.title = response.data.title;
        this.content = response.data.content;
        this.prefecture = response.data.prefecture;
        this.address = response.data.address;
        this.lat = response.data.lat;
        this.lng = response.data.lng;
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
    }
  },
};
</script>

<style scoped>
@import "../assets/common.css";


#form_custom {
  width: 540px;
  background-color: rgb(255, 255, 255);
  border: 2px solid #ccc;
}

#form_custom:hover {
  background-color: rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.uk-placeholder {
  padding-top: 75%;
  padding-bottom: 0px;
  margin-bottom: 0px;
}

.camera-choice {
  width: 180px;
  position: absolute;
  top: 50%;
  left: 50%;
  display: table-cell;
  vertical-align: middle;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}

#preview {
  position: absolute;
  width: 100%;
  height: 100%;
  right: 0px;
  top: 0px;
  z-index: 100;
  pointer-events: none;
}
#preview_image {
  width: 100%;
  height: 100%;
}
.uk-modal-body {
  border-radius: 5px;
}

.uk-modal-dialog {
  position: relative;
  box-sizing: border-box;
  margin: 0 auto;
  width: 1000px;
  max-width: calc(100% - 0.01px) !important;
  background: rgb(240, 240, 240);
  transition: 0.3s linear;
  transition-property: opacity, transform;
}

#select_way {
  font-size: 14px;
  color: rgb(145, 91, 56);
}
.v-application ul,
.v-application ol {
  padding-left: 0px;
}
.location_form {
  margin-top: 15px;
}
</style>
