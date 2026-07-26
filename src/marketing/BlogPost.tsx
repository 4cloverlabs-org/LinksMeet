import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getPost, POSTS } from './posts';
import './Blog.css';

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = slug ? getPost(slug) : undefined;

  if (!post) {
    return (
      <div className="cc-page">
        <div className="cc-container cc-page-hero">
          <h1>Article not found</h1>
          <p>That post doesn’t exist or may have moved.</p>
          <Link to="/blog" className="cc-btn cc-btn-primary" style={{ marginTop: 8 }}>Back to blog</Link>
        </div>
      </div>
    );
  }

  const more = POSTS.filter(p => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="cc-page">
      <article className="cc-article">
        <div>
          <Link to="/blog" className="cc-back"><ArrowLeft size={15} /> All articles</Link>
        </div>
        <div>
          <span className="cc-blog-cat">{post.category}</span>
        </div>
        <h1>{post.title}</h1>
        <div className="cc-blog-meta" style={{ marginTop: 12 }}>
          <span>{post.author}</span>
          <span className="dot">·</span>
          <time dateTime={post.iso}>{post.date}</time>
          <span className="dot">·</span>
          <span>{post.readTime}</span>
        </div>

        <div className="cc-article-art" style={{ backgroundImage: `url(${post.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

        <div className="cc-prose">
          {post.body.map((b, i) => {
            if (b.type === 'h2') return <h2 key={i}>{b.text}</h2>;
            if (b.type === 'quote') return <blockquote key={i}>{b.text}</blockquote>;
            if (b.type === 'ul') return <ul key={i}>{b.items.map((it, j) => <li key={j}>{it}</li>)}</ul>;
            return <p key={i}>{b.text}</p>;
          })}
        </div>

        {/* CTA */}
        <div className="cc-article-cta">
          <div>
            <h3>Put this into practice with LinksMeet</h3>
            <p>A simple, powerful scheduling tool that keeps every meeting's context in one place.</p>
          </div>
          <button className="cc-btn cc-btn-primary" onClick={() => navigate('/signup')}>Get started</button>
        </div>
      </article>

      {/* More posts */}
      <div className="cc-container" style={{ paddingBottom: 80 }}>
        <h3 className="cc-more-title">Keep reading</h3>
        <div className="cc-blog-grid">
          {more.map(p => (
            <Link to={`/blog/${p.slug}`} key={p.slug} className="cc-blog-card">
              <div className="cc-blog-card-art" style={{ backgroundImage: `url(${p.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div className="cc-blog-card-body">
                <span className="cc-blog-cat">{p.category}</span>
                <h3>{p.title}</h3>
                <p>{p.excerpt}</p>
                <span className="cc-blog-readmore">Read article <ArrowRight size={14} /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
