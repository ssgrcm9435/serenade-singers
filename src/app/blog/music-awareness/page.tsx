export const metadata = {
  title: "ဂီတပညာ၏ အရေးပါမှု | Serenade Singers",

  description:
    "ဂီတပညာ၏ အရေးပါမှုနှင့် music awareness အကြောင်း ဆောင်းပါး",

  openGraph: {
    title: "ဂီတပညာ၏ အရေးပါမှု",

    description:
      "ဂီတပညာ၏ အရေးပါမှုနှင့် music awareness အကြောင်း ဆောင်းပါး",

    url:
      "https://serenade-singers.onrender.com/blog/music-awareness",

    siteName: "Serenade Singers",

    images: [
      {
        url:
          "https://serenade-singers.onrender.com/og/music-awareness.jpg",

        width: 1200,

        height: 630,

        alt: "Serenade Singers Music Awareness",
      },
    ],

    locale: "en_US",

    type: "article",
  },

  twitter: {
    card: "summary_large_image",

    title: "ဂီတပညာ၏ အရေးပါမှု",

    description:
      "ဂီတပညာ၏ အရေးပါမှုနှင့် music awareness အကြောင်း ဆောင်းပါး",

    images: [
      "https://serenade-singers.onrender.com/og/music-awareness.jpg",
    ],
  },
};

export default function MusicAwarenessPage() {
  return (
    <main className="blog-page">
      <article className="blog-container">
        <a href="/blog" className="blog-back">
          ← Back to Blog
        </a>

        <div className="blog-hero-image">
          <img
            src="/og/music-awareness.jpg"
            alt="Music Awareness"
          />
        </div>

        <p className="blog-label">
          Music Awareness
        </p>

        <h1 className="blog-title">
          ဂီတပညာ၏ အရေးပါမှု
        </h1>

        <p className="blog-lead">
          ဂီတသည် ဖျော်ဖြေရေးတစ်ခုတည်းမဟုတ်ပါ။
          လူများကို ချိတ်ဆက်ပေးနိုင်သော၊
          စိတ်ခံစားမှုကို ဖော်ပြနိုင်သော၊
          ဖန်တီးနိုင်စွမ်းကို မြှင့်တင်ပေးနိုင်သော
          အရေးကြီးသော အင်အားတစ်ခုဖြစ်သည်။
        </p>

        <h2 className="blog-heading">
          ဂီတသည် စိတ်နှင့် ဦးနှောက်ကို ဖွံ့ဖြိုးစေသည်
        </h2>

        <p className="blog-text">
          ဂီတလေ့လာခြင်းသည် concentration,
          listening skills, memory, patience
          နှင့် discipline တို့ကို တိုးတက်စေသည်။
          Rhythm, Melody နှင့် Harmony တို့ကို
          နားလည်လာသည်နှင့်အမျှ
          လူတစ်ယောက်၏ အာရုံစူးစိုက်နိုင်စွမ်းနှင့်
          စနစ်တကျတွေးခေါ်နိုင်စွမ်း
          ပိုမိုကောင်းမွန်လာသည်။
        </p>

        <h2 className="blog-heading">
          ဂီတသည် လူများကို ချိတ်ဆက်ပေးသည်
        </h2>

        <p className="blog-text">
          Choir, band, orchestra နှင့် music
          community များတွင်
          လူတစ်ယောက်ချင်းစီ
          မတူညီသော role များရှိကြသော်လည်း
          harmony တစ်ခုတည်းအတွက်
          အတူတကွ လုပ်ဆောင်ကြသည်။
        </p>

        <h2 className="blog-heading">
          Serenade Singers ၏ ရည်ရွယ်ချက်
        </h2>

        <p className="blog-text">
          Serenade Singers သည်
          ဂီတကို performance အတွက်သာမဟုတ်ဘဲ
          learning, growth, creativity,
          friendship, harmony နှင့်
          community development အတွက်ပါ
          အသုံးပြုနိုင်သော
          positive music community
          တစ်ခုအဖြစ် တည်ဆောက်လိုပါသည်။
        </p>

        <blockquote className="blog-quote">
          “ဂီတသည် အသံတစ်ခုတည်းမဟုတ်ပါ။
          လူများကို ချိတ်ဆက်ပေးသော
          အင်အားတစ်ခုဖြစ်သည်။”
        </blockquote>
      </article>
    </main>
  );
}