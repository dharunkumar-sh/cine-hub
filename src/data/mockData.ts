export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  year: number;
  genre: string[];
  role: string;
  character?: string;
  poster: string;
  posterLandscape?: string;
  posterSquare?: string;
  rating: number;
  runtime?: number;
  director?: string;
  synopsis?: string;
}

export interface SocialLink {
  platform: "instagram" | "twitter" | "imdb" | "website";
  url: string;
  handle?: string;
}

export interface SimilarActor {
  id: string;
  name: string;
  photo: string;
  knownFor: string;
  bio?: string;
  stats?: {
    totalFilms: number;
    awardsWon: string | number;
  };
}

export interface Actor {
  id: string;
  name: string;
  alternateName?: string;
  birthDate: string;
  birthPlace: string;
  nationality: string;
  photo: string;
  backdropImage: string;
  bio: string;
  shortBio: string;
  filmography: Movie[];
  socialLinks: SocialLink[];
  similarActors: SimilarActor[];
  stats: {
    totalFilms: number;
    awardsWon: string | number;
    nominations: number;
    activeYears: string;
  };
}

export const genres = [
  "Drama",
  "Thriller",
  "Action",
  "Comedy",
  "Sci-Fi",
  "Romance",
  "Crime",
  "Mystery",
  "Adventure",
  "War",
  "Biography",
  "Horror",
] as const;

export const roles = [
  "Lead",
  "Supporting",
  "Cameo",
  "Voice",
  "Producer",
  "Director",
] as const;

export const mockActor: Actor = {
  id: "actor-001",
  name: "Sivakarthikeyan Doss",
  alternateName: "Sivakarthikeyan",
  birthDate: " 17 February 1985",
  birthPlace: "Singampunari, Sivaganga District",
  nationality: "Indian",
  photo: "/hero.jpg",
  backdropImage: "/background.jpg",
  shortBio:
    "Sivakarthikeyan, also known by his initials as SK, is an Indian actor, playback singer, lyricist, and film producer primarily active in Tamil cinema. He served as a television presenter before his entry into films.",
  bio: `Sivakarthikeyan was born on 17 February 1985 in Singampunari, Sivaganga district in a Tamil family. His father G. Doss was a jail superintendent. He has an elder sister, who is a doctor. He completed schooling at Campion Anglo-Indian Higher Secondary School in Tiruchirappalli and earned a Bachelor’s degree from JJ College of Engineering. He married Aarthi on 27 August 2010. The couple have three children, one daughter and two sons. His cousin is Arun Prabu, for which he collaborated with for Vaazhl (2021).`,
  filmography: [
    {
      id: "film-000",
      title: "Parasakthi",
      year: 2026,
      genre: ["Drama", "Political fiction"],
      role: "Lead",
      character: "Chezhiyan",
      poster: "/amaran.png",
      posterLandscape: "https://images.ottplay.com/images/parasakthi-poster-1738206213.jpg?impolicy=ottplay-202501_high&width=1200&height=675",
      posterSquare:
        "https://static.moviecrow.com/gallery/20251118/252122-Parasakthi%20Sivakarthikeyan%20Sudha%20Kongara%20GV%20Prakash%20Kumar%20Pongal%202026%20Release%20Date.jpg",
      rating: 0.0,
      runtime: 10,
      director: "Sudha Kongara Prasad",
      synopsis:
        "Parasakthi is an upcoming Indian Tamil-language political historical drama film directed by Sudha Kongara and produced by Aakash Bhaskaran of Dawn Pictures.",
    },
    {
      id: "film-002",
      title: "Madharaasi",
      year: 2025,
      genre: ["Action", "Thriller"],
      role: "Lead",
      character: "Raghu Ram",
      poster: "/madharaasi.png",
      posterLandscape:
        "https://www.acmodasi.in/amdb/images/movie/5/h/madharaasi-2025-B9Fhza.jpg",
      posterSquare: "/madharaasi.png",
      rating: 6.7,
      runtime: 168,
      director: "	A. R. Murugadoss",
      synopsis:
        "The story of an NIA officer who recruits a man suffering from Fregoli delusion to infiltrate an illegal arms syndicate, leading to a high-stakes battle to dismantle a cross-state gun-running operation and protect his loved ones.",
    },
    {
      id: "film-001",
      title: "Amaran",
      year: 2024,
      genre: ["Action", "Biography", "Adventure"],
      role: "Lead",
      character: "Major Mukund Varadarajan",
      poster: "/amaran.png",
      posterLandscape: "/amaran.png",
      posterSquare:
        "https://i.pinimg.com/736x/80/c5/b4/80c5b4fc125c958a6ce86f2e6c4b63ab.jpg",
      rating: 8.1,
      runtime: 169,
      director: "Rajkumar Periasamy",
      synopsis:
        "The life story of Major Mukund Varadarajan, an Indian Army officer who was posthumously awarded the Ashoka Chakra for his bravery during a counter-terrorism operation.",
    },
    {
      id: "film-003",
      title: "Ayalaan",
      year: 2024,
      genre: ["Sci-fi", "Action"],
      role: "Lead",
      character: "Tamizh",
      poster:
        "https://images.unsplash.com/photo-1518173946687-a4c036bc8a7c?w=400&h=600&fit=crop",
      posterLandscape:
        "https://m.media-amazon.com/images/M/MV5BM2FjMDhkMzEtMjc0Ni00MzcxLTg0ZDgtNGYzMjRhZmRhZTllXkEyXkFqcGc@._V1_.jpg",
      posterSquare:
        "https://i.pinimg.com/736x/a7/4c/2d/a74c2d97d17eefabac7c3ac5fe7e9f97.jpg",
      rating: 5.9,
      runtime: 155,
      director: "R. Ravikumar",
      synopsis:
        "The story of a nature-loving man who teams up with a stranded alien to protect a powerful cosmic element from a ruthless scientist, leading to a battle where he gains extraterrestrial powers to save his new friend.",
    },
    {
      id: "film-004",
      title: "Maaveeran",
      year: 2023,
      genre: ["Action", "Thriller"],
      role: "Lead",
      character: "Sathya",
      poster:
        "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
      posterLandscape:
        "https://www.re-thinkingthefuture.com/wp-content/uploads/2024/10/A13332-An-Architectural-Review-Of-Maaveeran-1.jpg?w=999",
      posterSquare:
        "https://i.pinimg.com/736x/98/f5/33/98f5330e1cae77d2ffa7ea00a0950f83.jpg",
      rating: 7.4,
      runtime: 166,
      director: "Madonne Ashwin",
      synopsis:
        "After an accident, a timid cartoonist begins to hear the voice of a comic character he has created. Guided by this voice, he takes a stand against a group of evil men.",
    },
    {
      id: "film-005",
      title: "Don",
      year: 2022,
      genre: ["Comedy", "Action"],
      role: "Lead",
      character: "Chakaravarthi Ganesan",
      poster:
        "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop",
      posterLandscape:
        "https://venkatarangan.com/wp-content/uploads/2022/05/don-2022-featured.jpg",
      posterSquare:
        "https://m.media-amazon.com/images/M/MV5BZWYxZjE5MDctMjFkMy00NDA5LTkxY2EtOGU5YjVhZjliNmZlXkEyXkFqcGc@._V1_.jpg",
      rating: 6.8,
      runtime: 163,
      director: "Cibi Chakaravarthi",
      synopsis:
        "A man reminisces his good old college days and thinks about how he managed to find his purpose and get his life together.",
    },
    {
      id: "film-006",
      title: "Prince",
      year: 2022,
      genre: ["Romance", "Comedy"],
      role: "Lead",
      character: "Anbarasan (Anbu)",
      poster:
        "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=600&fit=crop",
      posterLandscape:
        "https://img.airtel.tv/unsafe/fit-in/1600x0/filters:format(webp)/https://xstreamcp-assets-msp.streamready.in/assets/HOTSTAR_DTH/MOVIE/690de56247acf3687ff42e79/images/LANDSCAPE_169/1423117-h-2667411eaaab?o=production",
      posterSquare:
        "https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p23162803_p_v10_aa.jpg",
      rating: 4.5,
      runtime: 143,
      director: "K. V. Anudeep",
      synopsis:
        "A teacher of social science falls in love with a British woman who teaches English in the same school as him, but all hell breaks loose when they decide to marry.",
    },
    {
      id: "film-007",
      title: "Doctor",
      year: 2021,
      genre: ["Action", "Comedy"],
      role: "Lead",
      character: "Dr. N. Varun",
      poster:
        "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
      posterLandscape:
        "https://preview.redd.it/niwiv2rjs5t71.jpg?width=665&format=pjpg&auto=webp&s=39f266540edbb46b5b67a3a9aed680746d1ae5b1",
      posterSquare:
        "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/doctor-et00305742-02-02-2021-03-30-24.jpg",
      rating: 7.4,
      runtime: 151,
      director: "Nelson Dilipkumar",
      synopsis:
        "When a military doctor tracks down his former fiancee's kidnapped niece, he discovers a complex human trafficking ring in Goa. He then weaves an intricate trap to capture the perpetrators.",
    },
    {
      id: "film-008",
      title: "Hero",
      year: 2019,
      genre: ["Action", "Thriller"],
      role: "Lead",
      character: 'Sakthivel "Sakthi"',
      poster:
        "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop",
      posterLandscape:
        "https://img.nowrunning.com/content/movie/2019/hero-23899/bg2.jpg",
      posterSquare:
        "https://m.media-amazon.com/images/M/MV5BMDNhNWRlODAtNzkzOS00NDdhLTk5YTYtMzhiODUyMTAzOWVmXkEyXkFqcGc@._V1_.jpg",
      rating: 6.3,
      runtime: 164,
      director: "P. S. Mithran",
      synopsis:
        "Shakthi, a young man, helps Mathi, a student, exhibit her invention at an educational fair. However, when they both are falsely accused of a patent violation, he sets out to prove their innocence.",
    },
    {
      id: "film-009",
      title: "Mr. Local",
      year: 2019,
      genre: ["Comedy", "Romance"],
      role: "Lead",
      character: "Manohar",
      poster:
        "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=400&h=600&fit=crop",
      posterLandscape:
        "https://venkatarangan.com/wp-content/uploads/2019/05/mr-local-tamil-movie.jpg",
      posterSquare:
        "https://i.scdn.co/image/ab67616d0000b273b8afa87d42948ca4765828c8",
      rating: 3.4,
      runtime: 154,
      director: "M. Rajesh",
      synopsis:
        "Manohar constantly finds himself in a tussle with Keerthana, an egoistical woman, but eventually falls in love with her. However, she is far from thinking that he is good enough for her.",
    },
    {
      id: "film-010",
      title: "Namma Veettu Pillai",
      year: 2019,
      genre: ["Action", "Comedy"],
      role: "Lead",
      character: "Arumpon",
      poster:
        "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=600&fit=crop",
      posterLandscape:
        "https://sund-images.sunnxt.com/130051/1600x1200_NammaVeettuPillai_130051_d68e20dc-e683-4e30-b390-da28d4667355.jpg",
      posterSquare:
        "https://upload.wikimedia.org/wikipedia/en/8/88/Namma_Veetu_Pillai.jpg",
      rating: 6.0,
      runtime: 152,
      director: "Pandiraj",
      synopsis:
        "Due to pressure from his family, a young man is forced to marry his sister off to a local thug whom he dislikes. Later, the ruffian uses this relationship for bullying him.",
    },
    {
      id: "film-011",
      title: "Seemaraja",
      year: 2018,
      genre: ["Action", "Comedy"],
      role: "Lead",
      character: "Seema Raja, Kadambavel Raja",
      poster:
        "https://images.unsplash.com/photo-1460881680093-7cc2e7d3469a?w=400&h=600&fit=crop",
      posterLandscape: "https://i.ytimg.com/vi/ByXwBjR-o5c/maxresdefault.jpg",
      posterSquare:
        "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/seema-raja-et00071148-17-02-2018-04-04-34.jpg",
      rating: 4.3,
      runtime: 158,
      director: "Ponram",
      synopsis:
        "Seema Raja, the generous and carefree prince of Singampatti, becomes a responsible king and the saviour of his people after his grand-uncle reveals to him the history of his heroic heritage.",
    },
    {
      id: "film-012",
      title: "Kanaa",
      year: 2018,
      genre: ["Sport", "Drama"],
      role: "Supporting",
      character: "Nelson Dhilip Kumar (The Coach)",
      poster:
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=600&fit=crop",
      posterLandscape:
        "https://img.manoramamax.com/122556/1920x1080_Kanaa_122556_0635083f-98fa-4a3c-a176-1e0b2c904f09.jpg",
      posterSquare:
        "https://m.media-amazon.com/images/M/MV5BMjY3MmVjZGMtNTcyZi00MTJkLTg1OGUtN2UwMGZhZGIxMGExXkEyXkFqcGc@._V1_.jpg",
      rating: 7.6,
      runtime: 145,
      director: "Arunraja Kamaraj",
      synopsis:
        "Kousalya, a farmer's daughter, dreams of becoming an international cricketer and winning the Cricket World Cup. She faces various challenges as she pursues her dream with the support of her father.",
    },
    {
      id: "film-013",
      title: "Velaikkaran ",
      year: 2017,
      genre: ["Action", "Thriller"],
      role: "Lead",
      character: "Arivazhagan",
      poster:
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=600&fit=crop",
      posterLandscape:
        "https://m.media-amazon.com/images/S/pv-target-images/bccc433456910084d8233a64dd9d79924eb15c3382c22d6662d36a10ae073349.jpg",
      posterSquare:
        "https://m.media-amazon.com/images/M/MV5BYjcxMDQyNWItMWFkNC00Njc3LTk2OWUtNGMyNTVmOGEwOTQ5XkEyXkFqcGc@._V1_.jpg",
      rating: 7.2,
      runtime: 160,
      director: "Mohan Raja",
      synopsis:
        "After starting a community radio in his slum to spread social awareness against a local gangster, a young man leads a fight against food corporations producing adulterated products.",
    },
    {
      id: "film-014",
      title: "Kootathil Oruthan ",
      year: 2017,
      genre: ["Romance", "Drama"],
      role: "Special Appearance",
      character: "Guest",
      poster:
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=600&fit=crop",
      posterLandscape:
        "https://static.moviecrow.com/gallery/20170719/117480-8f125246005211.58450d2247a31.jpg",
      posterSquare:
        "https://m.media-amazon.com/images/M/MV5BOTVmNDI5ZWUtYzM3OS00OTU2LThmMTEtZTQzYTBjOTVhYjAzXkEyXkFqcGc@._V1_.jpg",
      rating: 6.7,
      runtime: 118,
      director: "	T. J. Gnanavel",
      synopsis:
        "Aravind, a regular average student, falls in love with Janani, the class topper. When she rejects his proposal, Aravind sets out to change his life and win Janani's love.",
    },
    {
      id: "film-015",
      title: "Remo",
      year: 2016,
      genre: ["Romance", "Comedy"],
      role: "Lead",
      character: 'Siva "SK" / Regina Motwani "Remo"',
      poster:
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=600&fit=crop",
      posterLandscape:
        "https://www.cinejosh.com/gallereys/movies/normal/remo_movie_posters_2110160222/remo_movie_posters_2110160222_05.jpg",
      posterSquare:
        "https://m.media-amazon.com/images/S/pv-target-images/9fffccd050d59f6d72e70740a0b3a8fc3ca835bb81a3d7b0a92d62ccf491ccf9.jpg",
      rating: 6.1,
      runtime: 150,
      director: "Bakkiyaraj Kannan",
      synopsis:
        "SK, an aspiring actor, falls in love with Kavya, a doctor. However, she is engaged to another man and SK tries to sabotage their relationship by making her fall for him.",
    },
    {
      id: "film-016",
      title: "Rajini Murugan",
      year: 2016,
      genre: ["Romance", "Action"],
      role: "Lead",
      character: "Rajini Murugan, Bosepandi (Cameo)",
      poster:
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=600&fit=crop",
      posterLandscape:
        "https://mir-s3-cdn-cf.behance.net/project_modules/fs/f2178349720871.58bd3dfc330e5.jpg",
      posterSquare:
        "https://m.media-amazon.com/images/S/pv-target-images/54ea49e8c68cb4efd2200aa4ede5ae8e32098a643d61e072be278ba745dbe963.jpg",
      rating: 5.9,
      runtime: 158,
      director: "	Ponram",
      synopsis:
        "Rajini, an unemployed young man, is in love with his childhood sweetheart, but her father opposes their relationship. Luck shines upon the couple after Rajini inherits his grandfather's property.",
    },
    {
      id: "film-017",
      title: "Kaaki Sattai",
      year: 2015,
      genre: ["Action", "Comedy"],
      role: "Lead",
      character: "Mathimaran Rathnavel",
      poster:
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=600&fit=crop",
      posterLandscape:
        "https://sund-images.sunnxt.com/7213/640x360_KaakiSattai_7213_f679e547-3df4-4b02-b2b6-9fd4f206a066.jpg",
      posterSquare:
        "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/kaaki-sattai-et00026255-10-04-2021-03-10-13.jpg",
      rating: 5.9,
      runtime: 156,
      director: "R. S. Durai Senthilkumar",
      synopsis:
        "Mathimaran, a police officer, learns about an organ donation racket from his lady-love, Divya. During the course of his investigation, he uncovers shocking secrets and faces unexpected obstacles.",
    },
    {
      id: "film-018",
      title: "Maan Karate",
      year: 2014,
      genre: ["Comedy", "Drama "],
      role: "Lead",
      character: 'Thomas Peter / "Maan Karate" Peter',
      poster:
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=600&fit=crop",
      posterLandscape:
        "https://i.pinimg.com/736x/c7/93/90/c79390892d82931751a8dfec605a5e6d.jpg",
      posterSquare:
        "https://m.media-amazon.com/images/S/pv-target-images/2ff4db8dbdc56c4df2d5d28432f7b92204c05e7db77c8a2dcb41b0722e2c3106.jpg",
      rating: 5.3,
      runtime: 156,
      director: "Krish Thirukumaran",
      synopsis:
        "Four friends meet a person during a trip who predicts their future by giving them a newspaper to be printed four months later. They work hard to make the prediction come true.",
    },
    {
      id: "film-019",
      title: "Kedi Billa Killadi Ranga",
      year: 2013,
      genre: ["Comedy", "Romance"],
      role: "Lead",
      character: "Pattai Murugan / Ranga Murugan",
      poster:
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=600&fit=crop",
      posterLandscape: "https://static.toiimg.com/photo/79458732.cms",
      posterSquare:
        "https://m.media-amazon.com/images/M/MV5BYmIwYjlhNDUtMjNhNC00YTAwLWIwYTItMzgyZTY2MWM4MmQxXkEyXkFqcGc@._V1_.jpg",
      rating: 5.7,
      runtime: 132,
      director: "Pandiraj",
      synopsis:
        "Kesavan and Murugan are friends who aim to make it big in politics by trying to impress people with their weird tricks. They pay no heed to others' advice and are rejected by their love interests.",
    },
    {
      id: "film-019",
      title: "Varuthapadatha Valibar Sangam",
      year: 2013,
      genre: ["Comedy", "Romance"],
      role: "Lead",
      character: " Bosepandi M.A, M.Phil.,",
      poster:
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=600&fit=crop",
      posterLandscape: "https://m.media-amazon.com/images/S/pv-target-images/6d2f608c26ee0c0e5acd3f21da48f9fa467845d4c475bb1b802a4aedb6b9c115._UR1920,1080_SX720_FMjpg_.jpg",
      posterSquare:
        "https://play-lh.googleusercontent.com/Mgo46lB1FCBBP_XJd-Kr2dh_mTAWqjmu1DnQ93_YPFc6BHf7Zgl2Zpb0MnYG1c9Mh4iL",
      rating: 7.0,
      runtime: 158,
      director: "Ponram",
      synopsis:
        "Two fun-loving youngsters Bosepandi and his friend create a lot of nuisance to the villagers. After having fallen for the daughter of the village chief, Bosepandi needs to use his wits to marry her.",
    },
    {
      id: "film-020",
      title: "Ethir Neechal",
      year: 2013,
      genre: ["Sport", "Comedy"],
      role: "Lead",
      character: "Kunjithapadham alias Harish",
      poster:
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=600&fit=crop",
      posterLandscape: "https://img.airtel.tv/unsafe/fit-in/1600x0/filters:format(webp)/https://xstreamcp-assets-msp.streamready.in/assets/HOTSTAR_DTH/MOVIE/690dea527485246374048b63/images/LANDSCAPE_169/1000036210-h?o=production",
      posterSquare:
        "https://m.media-amazon.com/images/M/MV5BNmNiMzQzM2UtMzRiNC00OTZlLWFjNGMtNDI0YThkZTZjYmE2XkEyXkFqcGc@._V1_.jpg",
      rating: 6.9,
      runtime: 122,
      director: "R.S. Durai Senthilkumar",
      synopsis:
        "Kunjithapadham is embarrassed by his name and has low self-confidence as well. When his lover, Geeta, a schoolteacher, motivates him to prove himself, he participates in the Chennai Marathon.",
    },
    {
      id: "film-021",
      title: "Manam Kothi Paravai",
      year: 2013,
      genre: ["Romance", "Comedy"],
      role: "Lead",
      character: "Kannan Ramaiah",
      poster:
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=600&fit=crop",
      posterLandscape: "https://sund-images.sunnxt.com/7022/1920x1080_ManamKothiParavai_7022_8a03ee56-5787-4aa8-9b49-65ffe9bf8e9d.jpg",
      posterSquare:
        "https://upload.wikimedia.org/wikipedia/en/6/66/Manam_kothi_paravai.jpg",
      rating: 5.6,
      runtime: 137,
      director: "S. Ezhil",
      synopsis:
        "Kannan loves Revathy, who belongs to a family of thugs. When her family arranges her marriage with someone else, Kannan's friends kidnap her but he is shocked when she says that she does not love him.",
    },
    {
      id: "film-022",
      title: "3 (Moonu)",
      year: 2012,
      genre: ["Romance", "Thriller"],
      role: "Supporting",
      character: "Kumaran",
      poster:
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=600&fit=crop",
      posterLandscape: "https://wallpapers.com/images/hd/3-moonu-movie-ram-janani-intimate-poster-57o8ri5fbzl5a123.jpg",
      posterSquare:
        "https://upload.wikimedia.org/wikipedia/en/d/d6/3_%282012_Tamil_film_soundtrack%29.jpg",
      rating: 7.4,
      runtime: 148,
      director: "Aishwarya Rajinikanth",
      synopsis:
        "Ram and Janani are high school sweethearts who eventually get married. However, when Ram suddenly commits suicide, a heartbroken and confused Janani tries to find out why he did it.",
    },
    {
      id: "film-023",
      title: "Marina",
      year: 2012,
      genre: ["Romance", "Thriller"],
      role: "Lead",
      character: "Senthilnaathan (Senthil)",
      poster:
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=600&fit=crop",
      posterLandscape: "https://m.media-amazon.com/images/S/pv-target-images/c364e334227fc82b44f48d60605330aa05bd3b1d09e7fea4f24c6faccfa71a2a.jpg",
      posterSquare:
        "https://m.media-amazon.com/images/M/MV5BNDk0ZmFjNjctODI2MS00NTJjLTlkYmMtMjQ4M2FiODI4ZDU2XkEyXkFqcGc@._V1_.jpg",
      rating: 5.7,
      runtime: 134,
      director: "Pandiraj",
      synopsis:
        "Ambikapathy escapes to Chennai to fulfil his dreams and he earns a living by selling goods on a beach. He faces many hurdles along the way but manages to overcome them in his pursuit for happiness.",
    },
  ],
  socialLinks: [
    {
      platform: "instagram",
      url: "https://www.instagram.com/sivakarthikeyan",
      handle: "@sivakarthikeyan",
    },
    {
      platform: "twitter",
      url: "https://x.com/Siva_Kartikeyan",
      handle: "@Siva_Kartikeyan",
    },
    { platform: "imdb", url: "https://www.imdb.com/name/nm4792434/?ref_=nv_sr_srsg_7_tt_0_nm_8_in_0_q_siva" },
  ],
  similarActors: [
    {
      id: "similar-001",
      name: "Rajinikanth",
      photo:
        "https://pbs.twimg.com/profile_images/1867278396725628928/5puY-Zq9_400x400.jpg",
      knownFor: "Superstar",
      bio: "Shivaji Rao Gaikwad, known professionally as Rajinikanth, is an Indian actor who predominantly works in Tamil cinema.",
      stats: { totalFilms: 170, awardsWon: 27 },
    },
    {
      id: "similar-002",
      name: "Kamal Haasan",
      photo:
        "https://preview.redd.it/why-was-kamal-hassan-never-able-to-succeed-in-bollywood-v0-h1ogfu1tb24f1.jpeg?width=640&crop=smart&auto=webp&s=8fb4b9d356fa9a082e9243ae106fd79df43ab384",
      knownFor: "Ulaganayagan",
      bio: "Kamal Haasan is an Indian filmmaker and politician, currently serving as a Member of Parliament, Rajya Sabha for Tamil Nadu.",
      stats: { totalFilms: 250, awardsWon: 25 },
    },
    {
      id: "similar-003",
      name: "Vijay",
      photo:
        "https://m.media-amazon.com/images/I/71Zg6RRQzsL.jpg",
      knownFor: "Thalapathy",
      bio: "Joseph Vijay Chandrasekhar, known professionally as Vijay, is an Indian film actor and politician.",
      stats: { totalFilms: 69, awardsWon: 30 },
    },
    {
      id: "similar-004",
      name: "Ravi Mohan",
      photo:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Jayam_Ravi_at_Naya_Gadget_Shop_Launch_Event.jpg/960px-Jayam_Ravi_at_Naya_Gadget_Shop_Launch_Event.jpg",
      knownFor: "Jayam Ravi",
      bio: "Ravi Mohan, better known by his former stage name Jayam Ravi, is an Indian actor, director and producer who works in Tamil cinema.",
      stats: { totalFilms: 35, awardsWon: 7 },
    },
    {
      id: "similar-005",
      name: "Ramalakshmanan Muthuchamy",
      photo:
        "https://th-i.thgim.com/public/entertainment/movies/7dde68/article69571801.ece/alternates/FREE_1200/HN_04051-Ed.jpg",
      knownFor: "Soori",
      bio: "Ramalakshmanan Muthuchamy, professionally known as Soori, is an Indian actor and comedian who predominantly appears in Tamil cinema.",
      stats: { totalFilms: 108, awardsWon: 3 },
    },
  ],
  stats: {
    totalFilms: 24,
    awardsWon: "15+",
    nominations: 15,
    activeYears: "2012 - Present",
  },
};

export interface WatchlistItem {
  id: string;
  movieId: string;
  title: string;
  poster: string;
  addedAt: number;
  watched: boolean;
  notes?: string;
}

export const generateMockWatchlist = (): WatchlistItem[] => {
  return mockActor.filmography.slice(0, 5).map((film, index) => ({
    id: `watchlist-${film.id}`,
    movieId: film.id,
    title: film.title,
    poster: film.poster,
    addedAt: Date.now() - index * 86400000, // Stagger by days
    watched: index === 0,
    notes: index === 0 ? "Amazing performance!" : undefined,
  }));
};
