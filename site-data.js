/* The Edit Society — site content.
   Edit text here; the home page, pricing, services, service, work and project pages all read from this file.
   Anything in [square brackets] is placeholder copy — replace it with your real numbers / names. */
window.TES = {
  bookUrl: 'index.html#book',

  // ---- Real work. "preview" = small silent loop shown on the page; "full" = original video opened on click (with sound).
  showreel: { preview: './assets/work/showreel.mp4', poster: './assets/work/showreel.jpg', full: 'https://ik.imagekit.io/5feqwwaxb/MARCA%20WEBSITE%2001.mp4' },
  reels: [
    { id: 'vastu', title: 'Vastu home tour', client: 'Interior brand', views: '512K', full: 'https://ik.imagekit.io/omgojp17s/Copy%20of%20VASTU%20512K%20VIEWS%20IG.mp4' },
    { id: 'limewash', title: 'Lime wash, celebrity home', client: 'Interior brand', views: '150K', full: 'https://ik.imagekit.io/omgojp17s/LIME%20WASH%20150K%20VIEWS%20IG.mp4' },
    { id: 'flooring', title: 'Kota stone flooring', client: 'Interior brand', views: '111K', full: 'https://ik.imagekit.io/omgojp17s/FLOORING%20IG%20111K%20VIEWS.mp4' },
    { id: 'payal', title: 'Payal & Zinal store launch', client: 'Fashion label', views: '85K', full: 'https://ik.imagekit.io/omgojp17s/PAYAL%20ZINAL%2085K%20IG%20VIEWS.mp4' },
    { id: 'accent', title: 'Accent wall ideas', client: 'Interior brand', views: '25K', full: 'https://ik.imagekit.io/omgojp17s/ACCENT%20WALL%2025K%20VIEWS.mp4' },
    { id: 'r22k', title: 'How cricketers really earn', client: 'Finance creator', views: '22K', full: 'https://ik.imagekit.io/omgojp17s/22K.mp4' },
    { id: 'r45k', title: '₹1.5 crore home: rent or EMI?', client: 'Finance creator', views: '4.5K', full: 'https://ik.imagekit.io/omgojp17s/4.5K.mp4' }
  ],
  longs: [
    { id: 'long1', title: 'A soldier’s story, told cinematic', client: 'Vedang Rathore', cat: 'YouTube · Storytelling', length: '9:39', full: 'https://res.cloudinary.com/fhwvxdg0/video/upload/v1790857297/1_Vedang_Rathore.mp4' },
    { id: 'long2', title: 'Founder conversation & project film', client: 'MS Design Studio', cat: 'Brand film', length: '11:19', full: 'https://res.cloudinary.com/fhwvxdg0/video/upload/v1790857306/2_MS_Design_Studio.mp4' },
    { id: 'long3', title: 'Sketch-to-real home walkthrough', client: 'MS Design Studio', cat: 'Walkthrough', length: '7:24', full: 'https://res.cloudinary.com/fhwvxdg0/video/upload/v1790860111/3_MS_Design_Studio.mp4' },
    { id: 'long4', title: 'Home tour & behind the scenes', client: 'MS Design Studio', cat: 'YouTube · BTS', length: '8:21', full: 'https://res.cloudinary.com/fhwvxdg0/video/upload/v1790860112/4_MS_Design_Studio.mp4' }
  ],

  // ---- Pricing (per-video prices by pack size). Used by the home page and pricing.html.
  pricing: {
    packs: [4, 8, 12],
    save: { 4: '', 8: 'save 8%', 12: 'save 15%' },
    simple: { 4: 2499, 8: 2299, 12: 2099 },
    complex: { 4: 3999, 8: 3699, 12: 3399 },
    premiumFrom: 24999,
    validity: '60 days',
    // Comparison table rows: [label, Simple, Complex, Premium]. true = included, false = not included, text = detail.
    compare: [
      ['Editing', null],
      ['Best for', 'Lifestyle & social-first reels', 'Talking-head, YouTube, podcasts', 'Launches & brand campaigns'],
      ['Video length', 'Up to 90 sec', 'Up to 90 sec (long-form on request)', 'Any length'],
      ['Cuts, pacing & hook', true, true, true],
      ['Captions', 'Clean captions', 'Animated, brand-styled', 'Custom animated typography'],
      ['Music & sound', 'Licensed music', 'Music + sound design & SFX', 'Custom sound design & mix'],
      ['Colour', 'Basic correction', 'Advanced grade for mood', 'Full grade, film looks & matching'],
      ['Motion graphics', false, 'Titles, zooms & lower-thirds', 'Custom motion packages & VFX'],
      ['B-roll & stock', 'Simple layering', 'Strategic b-roll', 'Cinematic sequencing'],
      ['Story restructure for retention', false, true, true],
      ['Scripting & hook support', false, false, true],
      ['Delivery', null],
      ['First cut', '48–72 hours', '48–72 hours', 'Scheduled to your launch'],
      ['Revision rounds per video', '2', '2', '3'],
      ['Videos in production at once', '1', '1', 'Up to 3'],
      ['Export formats', '1 ratio', '2 ratios (e.g. 9:16 + 16:9)', 'Every ratio you need'],
      ['Two-step quality check', true, true, true],
      ['Support', null],
      ['Client dashboard', true, true, true],
      ['Dedicated project manager', false, true, true],
      ['Creative director on your project', false, false, true],
      ['Priority queue', false, false, true],
      ['Pack validity', '60 days, auto-renews', '60 days, auto-renews', 'Per project']
    ],
    addons: [
      ['Custom thumbnail', '₹[499]', 'Designed to match your channel'],
      ['Extra format / resize', '₹[499]', 'e.g. a 9:16 cut of a 16:9 video'],
      ['Extra revision round', '₹[399]', 'After your included rounds are used'],
      ['Rush delivery (24 h)', '+30%', 'For time-sensitive posts'],
      ['Subtitles in another language', '₹[299]', 'Hindi, English and more'],
      ['Raw footage over 60 min', '₹[999]', 'Per extra hour of footage']
    ]
  },

  services: [
    {
      slug: 'short-form', title: 'Reels & Shorts', titleHtml: 'Reels <span class="serif">&amp;</span> Shorts',
      short: 'Hook-first vertical edits for Instagram, YouTube Shorts and TikTok.',
      lead: 'Vertical edits built to stop the scroll in the first second and hold people to the last frame — captioned, scored and ready to post.',
      video: 'lifestyle', chips: ['9:16', '4:5', 'Captions', 'Hooks'],
      includes: ['Hook rewrite & cold open in the first 2 seconds', 'Jump cuts, pacing & pattern interrupts', 'Animated captions in your brand style', 'Music, SFX & a clean sound mix', 'Basic colour correction', 'Safe-zone check for every platform'],
      specs: [['Formats', '9:16 · 4:5'], ['Length', 'Up to 90 sec'], ['Turnaround', '48–72 hrs'], ['Revisions', '2 rounds']],
      price: '₹[2,499]', unit: '/ video', pre: '',
      faqs: [
        ['Can you turn my long videos into shorts?', 'Yes. Send the long-form file and we pull the strongest moments, re-hook them and cut them vertical.'],
        ['Do you write the hooks?', 'We suggest hook lines and on-screen text for every edit. You approve or tweak them in the first revision.'],
        ['Which platforms do you deliver for?', 'Instagram Reels, YouTube Shorts, TikTok and LinkedIn — each export respects that platform’s safe zones.']
      ],
      work: ['run-club', 'studio-sessions']
    },
    {
      slug: 'youtube', title: 'Long-form YouTube', titleHtml: 'Long-form <span class="serif">YouTube</span>',
      short: 'Retention-first edits for talking-head, documentary and vlog channels.',
      lead: 'We restructure your footage around the story, cut the dead air and layer in b-roll, motion and sound so viewers stay to the end screen.',
      video: 'youtube', chips: ['16:9', '4K', 'Chapters', 'Thumbnails'],
      includes: ['Story restructure & retention edit', 'B-roll, zooms & motion text', 'Sound design & licensed music', 'Colour grade', 'Chapters & end screens', 'Thumbnail concepts (add-on)'],
      specs: [['Formats', '16:9 · 4K'], ['Length', 'Up to 30 min'], ['Turnaround', '4–6 days'], ['Revisions', '2 rounds']],
      price: '₹[7,999]', unit: '/ video', pre: 'from',
      faqs: [
        ['How much raw footage can I send?', 'Up to 3 hours of raw footage per finished video is included. Longer shoots are quoted separately.'],
        ['Do you make thumbnails?', 'Yes — thumbnail concepts and final designs are available as an add-on to any long-form edit.'],
        ['Can you match my current channel style?', 'Send 2–3 of your videos and your fonts. We build a style guide every editor on your account follows.']
      ],
      work: ['why-i-quit', 'behind-the-cut']
    },
    {
      slug: 'podcast', title: 'Podcast clips', titleHtml: 'Podcast <span class="serif">clips</span>',
      short: 'The best moments from every episode, cut for every feed.',
      lead: 'We watch the whole episode so you don’t have to — then cut the moments people actually share, with speaker captions and clean audio.',
      video: 'podcast', chips: ['9:16', '1:1', '16:9', 'Multicam'],
      includes: ['Best-moment selection from the full episode', 'Multicam switching', 'Speaker captions & lower-thirds', 'Audio clean-up & levelling', 'Vertical and horizontal exports', 'Episode trailers'],
      specs: [['Formats', '9:16 · 1:1 · 16:9'], ['Length', '30–90 sec'], ['Turnaround', '72 hrs / pack'], ['Revisions', '2 rounds']],
      price: '₹[1,999]', unit: '/ clip', pre: 'from',
      faqs: [
        ['How many clips per episode?', 'Most shows take 4–8 clips per episode. Pick a pack size and we choose the strongest moments.'],
        ['Can you edit the full episode too?', 'Yes. Full-episode edits for YouTube are quoted with your clip pack.'],
        ['Do you fix bad audio?', 'We clean noise, level voices and fix echo where possible. Very poor recordings are flagged before we start.']
      ],
      work: ['ep-41', 'studio-sessions']
    },
    {
      slug: 'ads', title: 'Ads & e-commerce', titleHtml: 'Ads <span class="serif">&amp;</span> e-commerce',
      short: 'Performance creatives and hook variants built for testing.',
      lead: 'Thumb-stopping ad edits with multiple hooks, clear offers and platform-native cuts — so your media buyer always has something new to test.',
      video: 'app', chips: ['UGC', 'Hook variants', 'Meta', 'YouTube'],
      includes: ['3+ hook variants per ad', 'UGC & product-demo edits', 'Offer & CTA end cards', 'Platform-specific cuts (Meta, YouTube, TikTok)', 'Captions & compliance-safe text', 'Monthly creative refresh'],
      specs: [['Formats', '9:16 · 1:1 · 16:9'], ['Length', '15–60 sec'], ['Turnaround', '72 hrs'], ['Revisions', '2 rounds']],
      price: '₹[3,999]', unit: '/ ad', pre: 'from',
      faqs: [
        ['Do you write ad scripts?', 'We can outline hooks and structure from your product brief. Full scripting is part of the Premium plan.'],
        ['Can you work with UGC creators’ footage?', 'Yes — send the raw UGC and we cut it into multiple tested formats.'],
        ['How many variants do I get?', 'Every ad ships with at least three hook variants and the platform cuts you need.']
      ],
      work: ['app-launch', 'run-club']
    },
    {
      slug: 'motion', title: 'Motion graphics', titleHtml: 'Motion <span class="serif">graphics</span>',
      short: 'Titles, explainers and brand motion that make edits feel premium.',
      lead: 'From kinetic captions to full product explainers — motion design that makes your content look like it came from a much bigger team.',
      video: 'behind', chips: ['Explainers', 'Titles', 'Logo stings', 'UI'],
      includes: ['Animated titles & lower-thirds', 'Explainer animations', 'Logo stings & intros', 'Kinetic typography', 'Data & UI animations', 'Reusable brand motion templates'],
      specs: [['Formats', 'Any ratio'], ['Length', 'Up to 2 min'], ['Turnaround', '5–7 days'], ['Revisions', '2 rounds']],
      price: '₹[9,999]', unit: '/ project', pre: 'from',
      faqs: [
        ['Do I need brand guidelines?', 'Helpful but not required. Send your logo, fonts and colours and we design around them.'],
        ['Can you animate app or website screens?', 'Yes — send screen recordings or design files and we build clean UI animations.'],
        ['Will I get editable templates?', 'Brand motion templates can be delivered as project files on request.']
      ],
      work: ['app-launch', 'behind-the-cut']
    },
    {
      slug: 'colour', title: 'Colour grading', titleHtml: 'Colour <span class="serif">grading</span>',
      short: 'Consistent, cinematic colour — from phone footage to log.',
      lead: 'We match every shot, fix skin tones and give your footage a signature look, so your feed feels like one consistent world.',
      video: 'travel', chips: ['Log', 'RAW', 'Phone', 'LUTs'],
      includes: ['Shot matching across cameras', 'Skin-tone correction', 'Signature look / LUT creation', 'Mood & day-for-night grades', 'HDR and log footage', 'Exports for every platform'],
      specs: [['Footage', 'Log · RAW · phone'], ['Length', 'Any length'], ['Turnaround', '48–72 hrs'], ['Revisions', '2 rounds']],
      price: '₹[1,499]', unit: '/ video', pre: 'from',
      faqs: [
        ['Can you grade phone footage?', 'Yes. Most of our creators shoot on phones — we grade within what the footage allows.'],
        ['Will you build me a LUT?', 'Yes — we can create a signature LUT so your own quick edits match our grades.'],
        ['Can I add grading to another edit?', 'Colour is included in every edit plan; standalone grading is for footage edited elsewhere.']
      ],
      work: ['golden-hour', 'on-set']
    },
    {
      slug: 'brand-films', title: 'Brand films', titleHtml: 'Brand <span class="serif">films</span>',
      short: 'Launch films and brand stories, with cut-downs for every channel.',
      lead: 'Story-led films for launches, campaigns and company moments — delivered with the social cut-downs you need to run them everywhere.',
      video: 'hero', chips: ['Launch', 'Campaign', 'Interviews', 'Cut-downs'],
      includes: ['Story & script support', 'Multi-cam & interview edits', 'Licensed music & sound design', 'Colour grade & motion titles', 'Cut-downs for social', 'Subtitles in multiple languages'],
      specs: [['Formats', '16:9 + social cuts'], ['Length', '1–5 min'], ['Turnaround', '7–10 days'], ['Revisions', '3 rounds']],
      price: '₹[24,999]', unit: '/ film', pre: 'from',
      faqs: [
        ['Do you shoot as well?', 'We are an editing studio. We can recommend shoot partners and plan shot lists with them.'],
        ['How many cut-downs are included?', 'Every film includes up to three social cut-downs; more can be added.'],
        ['Can you work to a fixed launch date?', 'Yes — tell us the date on the first call and we plan the schedule back from it.']
      ],
      work: ['on-set', 'golden-hour']
    }
  ],

  audiences: [
    { title: 'Creators', desc: 'Hook-first edits people actually finish.', items: [['Instagram Reels', 'short-form'], ['YouTube Shorts', 'short-form'], ['Long-form YouTube', 'youtube'], ['Podcast clips', 'podcast'], ['Thumbnails', 'youtube']] },
    { title: 'Brands', desc: 'On-brand content every week, without the in-house team.', hot: true, items: [['Product launch films', 'brand-films'], ['E-commerce ads', 'ads'], ['Explainers', 'motion'], ['Motion graphics', 'motion'], ['Monthly social batch', 'short-form']] },
    { title: 'Agencies', desc: 'Your brand, our editors, zero credit.', items: [['Creative ad variants', 'ads'], ['Corporate videos', 'brand-films'], ['Bulk content', 'short-form'], ['Colour & finishing', 'colour'], ['White-label delivery', 'brand-films']] }
  ],

  projects: [
    {
      slug: 'why-i-quit', title: 'Why I quit my 9–5', client: 'Finance YouTuber', cat: 'Long-form', service: 'youtube', video: 'youtube', shape: 'land',
      year: '2026', platform: 'YouTube', deliverables: '22-min edit, 3 shorts, thumbnail', turnaround: '5 days',
      brief: 'A 22-minute talking-head story about leaving a corporate job. Two hours of single-camera footage, no b-roll, and an audience that usually drops off in the first minute.',
      approach: ['Rebuilt the story around three turning points and opened on the resignation email', 'Cut 2 hours to 22 minutes with punch-ins to fake a second camera angle', 'Added archive b-roll, money-flow motion graphics and chapter cards', 'Cut three Shorts from the same footage to drive traffic to the long video'],
      results: [['[+38%]', 'average view duration'], ['[2.1M]', 'views in 30 days'], ['[+24k]', 'new subscribers']],
      quote: ['They found the story in two hours of me talking. ', 'Best-performing video', ' on the channel.'], who: ['[Client name]', 'Finance YouTuber']
    },
    {
      slug: 'app-launch', title: 'App launch explainer', client: 'SaaS startup', cat: 'Motion', service: 'motion', video: 'app', shape: 'port',
      year: '2026', platform: 'Web, LinkedIn, X', deliverables: '60-sec explainer, 4 ad cuts', turnaround: '7 days',
      brief: 'A product launch needed a 60-second explainer that made a complex workflow feel simple — plus ad cut-downs for paid social on launch day.',
      approach: ['Scripted the story around one user’s “before and after” day', 'Animated the real product UI instead of generic icons', 'Built a motion kit so the in-house team can make follow-up posts', 'Delivered four ad cut-downs with different hooks for testing'],
      results: [['[3.4×]', 'launch-day sign-ups vs. target'], ['[61%]', 'video completion rate'], ['[−32%]', 'cost per sign-up on ads']],
      quote: ['Our launch video finally ', 'explained the product', ' in a minute.'], who: ['[Client name]', 'Co-founder, SaaS startup']
    },
    {
      slug: 'ep-41', title: 'Ep. 41 — the best 60 seconds', client: 'Founder podcast', cat: 'Podcast', service: 'podcast', video: 'podcast-ep', shape: 'land',
      year: '2026', platform: 'Instagram, YouTube Shorts', deliverables: '8 clips, 1 trailer', turnaround: '72 hrs',
      brief: 'A weekly two-camera founder podcast with great conversations that weren’t reaching anyone outside the existing audience.',
      approach: ['Picked eight moments with a clear hook in the first sentence', 'Multicam switching on every speaker change', 'Bold speaker captions styled to the show’s brand', 'Cleaned and levelled audio so clips sound good on phone speakers'],
      results: [['[+410%]', 'clip reach month on month'], ['[+9k]', 'new podcast followers'], ['[8]', 'clips every week, on time']],
      quote: ['Our podcast clips finally look like ', 'the big shows', '.'], who: ['[Client name]', 'Founder, podcast host']
    },
    {
      slug: 'golden-hour', title: 'Golden hour, graded', client: 'Travel creator', cat: 'Colour', service: 'colour', video: 'travel', shape: 'port',
      year: '2026', platform: 'Instagram, YouTube', deliverables: 'Grade + signature LUT', turnaround: '48 hrs',
      brief: 'Drone, phone and mirrorless footage from a road trip that all looked different. The creator wanted one warm, consistent look across the series.',
      approach: ['Matched three cameras to a single reference frame', 'Built a warm “golden hour” look that protects skin tones', 'Delivered a matching LUT for the creator’s own quick edits', 'Exported platform-ready versions for Reels and YouTube'],
      results: [['[3]', 'cameras matched to one look'], ['[1]', 'signature LUT delivered'], ['[+19%]', 'saves on the series']],
      quote: ['Everything finally ', 'looks like one trip', ' instead of three cameras.'], who: ['[Client name]', 'Travel creator']
    },
    {
      slug: 'run-club', title: 'Run club, every Sunday', client: 'Fitness creator', cat: 'Short-form', service: 'short-form', video: 'lifestyle', shape: 'port',
      year: '2026', platform: 'Instagram Reels', deliverables: '12 reels / month', turnaround: '48 hrs each',
      brief: 'A fitness creator filming a weekly run club needed a steady stream of reels without losing their Sundays to editing.',
      approach: ['Created a repeatable reel format with a recognisable cold open', 'Cut to the beat with speed ramps on every stride', 'Built a caption style the audience now recognises', 'Batch-delivered twelve reels a month on a fixed schedule'],
      results: [['[+52%]', 'average reel reach'], ['[12]', 'reels a month, never late'], ['[0]', 'Sundays lost to editing']],
      quote: ['I used to lose my Sundays to editing. Now I film and ', 'post all week', '.'], who: ['[Client name]', 'Fitness creator']
    },
    {
      slug: 'studio-sessions', title: 'Studio sessions clip pack', client: 'Music & culture podcast', cat: 'Podcast', service: 'podcast', video: 'podcast', shape: 'land',
      year: '2026', platform: 'TikTok, Reels, Shorts', deliverables: '6 clips / episode', turnaround: '72 hrs',
      brief: 'A studio podcast with musicians as guests wanted clips that felt as polished as the music videos their guests release.',
      approach: ['Selected moments that work without context', 'Graded the studio to a moody, consistent look', 'Added animated lower-thirds with guest names and releases', 'Exported vertical, square and horizontal versions of every clip'],
      results: [['[+3.2×]', 'shares per clip'], ['[6]', 'clips per episode'], ['[+14k]', 'new followers in 60 days']],
      quote: ['The clips feel like ', 'part of the music', ', not an afterthought.'], who: ['[Client name]', 'Podcast producer']
    },
    {
      slug: 'on-set', title: 'On set: a launch film', client: 'D2C brand', cat: 'Brand film', service: 'brand-films', video: 'hero', shape: 'port',
      year: '2026', platform: 'Web, YouTube, Instagram', deliverables: '90-sec film, 3 cut-downs', turnaround: '9 days',
      brief: 'A product launch shot on a big crane day — hours of beautiful footage that needed to become one confident 90-second film and social cut-downs.',
      approach: ['Built the edit around the product reveal at the 45-second mark', 'Graded for a premium, slightly cool look', 'Licensed a score and designed sound around the camera moves', 'Cut 15, 30 and 60-second versions for paid and organic social'],
      results: [['[1]', 'hero film + 3 cut-downs'], ['[+27%]', 'landing-page conversion'], ['[9]', 'days from footage to launch']],
      quote: ['It looked like a ', 'big-agency film', ' on a startup timeline.'], who: ['[Client name]', 'Brand lead, D2C brand']
    },
    {
      slug: 'behind-the-cut', title: 'Behind the cut', client: 'The Edit Society', cat: 'Showreel', service: 'motion', video: 'behind', shape: 'land',
      year: '2026', platform: 'Web, Instagram', deliverables: 'Studio showreel', turnaround: 'In-house',
      brief: 'Our own showreel — a look at how the studio works, from first rough cut to final colour, in under a minute.',
      approach: ['Paired real timelines with the finished frames they became', 'Cut to a single track with no voice-over', 'Graded everything to the studio’s warm-and-dark palette', 'Made vertical and horizontal versions for the site and socials'],
      results: [['[10,000+]', 'videos delivered'], ['[100+]', 'creators & brands'], ['[48 hr]', 'average turnaround']],
      quote: ['We edit for creators who post every week — and we ', 'never miss a day', '.'], who: ['The Edit Society', 'A Marca Creatives studio']
    }
  ]
};
