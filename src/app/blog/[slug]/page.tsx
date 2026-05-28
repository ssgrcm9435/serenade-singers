import { blogs } from "@/data/blogs";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return blogs.map((blog) => ({
    slug: blog.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const blog = blogs.find((item) => item.slug === slug);

  if (!blog) {
    return {};
  }

  const url = `https://serenade-singers.onrender.com/blog/${blog.slug}`;
  const imageUrl = `https://serenade-singers.onrender.com${blog.image}`;

  return {
    title: `${blog.title} | Serenade Singers`,
    description: blog.description,

    openGraph: {
      title: blog.title,
      description: blog.description,
      url,
      siteName: "Serenade Singers",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: blog.alt,
        },
      ],
      locale: "en_US",
      type: "article",
    },

    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.description,
      images: [imageUrl],
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const blog = blogs.find((item) => item.slug === slug);

  if (!blog) {
    notFound();
  }

  return (
    <main className="blog-page">
      <article className="blog-container">
        <a href="/blog" className="blog-back">
          ← Back to Blog
        </a>

        <div className="blog-hero-image">
          <img src={blog.image} alt={blog.alt} />
        </div>

        <p className="blog-label">{blog.category}</p>

        <h1 className="blog-title">{blog.title}</h1>

        {blog.content.map((block, index) => {
          if (block.type === "heading") {
            return (
              <h2 key={index} className="blog-heading">
                {block.text}
              </h2>
            );
          }

          if (block.type === "quote") {
            return (
              <blockquote key={index} className="blog-quote">
                “{block.text}”
              </blockquote>
            );
          }

          return (
            <p key={index} className={index === 0 ? "blog-lead" : "blog-text"}>
              {block.text}
            </p>
          );
        })}
      </article>
    </main>
  );
}
