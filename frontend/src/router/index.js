import Vue from 'vue'
import VueRouter from 'vue-router'
// import Home from '@/views/Home'
import LoginPage from '@/views/LoginPage'
import store from '@/store'
import HomePage from '@/views/HomePage'
import DetailPage from '@/views/DetailPage'
import MyPage from '@/views/MyPage'
import NewPostPage from '@/views/NewPostPage'
import SignUpPage from '@/views/SignUpPage'
import ProfileEditPage from '@/views/ProfileEditPage'
import LatestPosts from '@/components/LatestPosts'
import PopularPosts from '@/components/PopularPosts'
import CategoryPosts from '@/components/CategoryPosts'
import Map from '@/components/Map'
import Search from '@/components/Search'


Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: HomePage,
      children: [
        {
          path: '',
            component: LatestPosts
        },
        {
          path: 'popular',
          component: PopularPosts
        },
        {
          path: 'category',
          component: CategoryPosts
        },
        {
          path: 'map',
          component: Map
        },
        {
          path: 'search',
          name: 'search',
          component: Search
        },
      ]
    },
    {
      path: '/detail/:id',
      name: 'detail',
      component: DetailPage,
      props: routes => ({
        id: Number(routes.params.id)
      })

    },
    {
      path: '/login',
      component: LoginPage
    },
    {
      path: '/mypage',
      component: MyPage

    },
    {
      path: '/newpostpage',
      component: NewPostPage
    },
    {
      path: '/signup',
      component: SignUpPage
    },
    {
      path: '/profile_edit',
      component: ProfileEditPage
    },
    {
      path: '*',
      redirect: '/'
    },
  ]
})


/**
 * Routerによって画面遷移する際に毎回実行される
 */
router.beforeEach((to, from, next) => {

  const isLoggedIn = store.getters['auth/isLoggedIn']
  const token = localStorage.getItem('access')
  console.log('to.path=', to.path)
  console.log('isLoggedIn=', isLoggedIn)

  // ログインが必要な画面に遷移しようとした場合
  if (to.matched.some(record => record.meta.requiresAuth)) {

    // ログインしている状態の場合
    if (isLoggedIn) {
      console.log('User is already logged in. So, free to next.')
      next()

      // ログインしていない状態の場合
    } else {
      // まだ認証用トークンが残っていればユーザー情報を再取得
      if (token != null) {
        console.log('User is not logged in. Trying to reload again.')

        store.dispatch('auth/reload')
          .then(() => {
            // 再取得できたらそのまま次へ
            console.log('Succeeded to reload. So, free to next.')
            next()
          })
          .catch(() => {
            // 再取得できなければログイン画面へ
            forceToLoginPage(to, from, next)
          })
      } else {
        // 認証用トークンが無い場合は、ログイン画面へ
        forceToLoginPage(to, from, next)
      }
    }

  } else {
    // ログインが不要な画面であればそのまま次へ
    console.log('Go to public page.')
    next()
  }
})

/**
 * ログイン画面へ強制送還
 */
function forceToLoginPage(to, from, next) {
  console.log('Force user to login page.')
  next({
    path: '/login',
    // 遷移先のURLはクエリ文字列として付加
    query: {
      next: to.fullPath
    }
  })
}



export default router
