"use client";

import Script from "next/script";

type Props = {
  slug: string;
  title: string;
};

export default function DisqusComments({ slug, title }: Props) {
  const shortname = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME;

  if (!shortname) {
    return null;
  }

  const pageUrl = `https://serenade-singers.onrender.com/blog/${slug}`;

  return (
    <section className="comments-section">
      <h2 className="comments-title">Comments</h2>

      <div id="disqus_thread" />

      <Script id={`disqus-${slug}`} strategy="afterInteractive">
        {`
          var disqus_config = function () {
            this.page.url = "${pageUrl}";
            this.page.identifier = "${slug}";
            this.page.title = "${title}";
          };

          (function() {
            var d = document, s = d.createElement('script');
            s.src = 'https://${shortname}.disqus.com/embed.js';
            s.setAttribute('data-timestamp', +new Date());
            (d.head || d.body).appendChild(s);
          })();
        `}
      </Script>
    </section>
  );
}
