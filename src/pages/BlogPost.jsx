import { useParams } from 'react-router'
import BlogPostView from '../sections/blogs/BlogPostView.jsx'

// /blogs/:slug, rendered inside Layout (navbar and footer stay)
export default function BlogPost() {
  const { slug } = useParams()
  return <BlogPostView slug={slug} />
}
