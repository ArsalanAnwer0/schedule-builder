import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import TopicPage from './pages/TopicPage'
import NewTopicPage from './pages/NewTopicPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:categorySlug" element={<CategoryPage />} />
          <Route path="/:categorySlug/:topicId" element={<TopicPage />} />
          <Route path="/new" element={<NewTopicPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default App
