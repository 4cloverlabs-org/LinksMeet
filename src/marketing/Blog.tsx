import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { POSTS } from './posts';
import './Blog.css';

export default function Blog() {
  const [featured, ...rest] = POSTS;
  return (
    <div className="cc-page">
      <div className="cc-container">
        <div className="cc-page-hero cc-reveal">
          <span className="cc-eyebrow">Blog</span>
          <h1 style={{ fontWeight: 500, letterSpacing: '-0.02em' }}>Ideas on selling, simply.</h1>
          <p>Practical writing on sales process, pipeline, and getting more done with less software.</p>
        </div>

        {/* Featured */}
        <Link to={`/blog/${featured.slug}`} className="cc-blog-featured cc-reveal">
          <div className="cc-blog-featured-art" style={{ backgroundImage: `url(${featured.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="cc-blog-featured-body">
            <span className="cc-blog-cat">{featured.category}</span>
            <h2>{featured.title}</h2>
            <p>{featured.excerpt}</p>
            <div className="cc-blog-meta">
              <span>{featured.author}</span>
              <span className="dot">·</span>
              <time dateTime={featured.iso}>{featured.date}</time>
              <span className="dot">·</span>
              <span>{featured.readTime}</span>
            </div>
            <span className="cc-blog-readmore">Read article <ArrowRight size={15} /></span>
          </div>
        </Link>

        {/* Grid */}
        <div className="cc-blog-grid">
          {rest.map(p => (
            <Link to={`/blog/${p.slug}`} key={p.slug} className="cc-blog-card cc-reveal">
              <div className="cc-blog-card-art" style={{ backgroundImage: `url(${p.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div className="cc-blog-card-body">
                <span className="cc-blog-cat">{p.category}</span>
                <h3>{p.title}</h3>
                <p>{p.excerpt}</p>
                <div className="cc-blog-meta">
                  <time dateTime={p.iso}>{p.date}</time>
                  <span className="dot">·</span>
                  <span>{p.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
