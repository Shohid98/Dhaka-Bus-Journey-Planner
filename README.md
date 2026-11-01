# Dhaka Bus Journey Planner — Starter v1.0

বাংলা ও English সমর্থিত GitHub Pages-ready PWA starter.

## গুরুত্বপূর্ণ
এই সংস্করণে কোনো বাসের রুট, স্টপেজ বা ভাড়া যাচাইকৃত হিসেবে যোগ করা হয়নি। `data/*.json` ফাইলগুলো ইচ্ছাকৃতভাবে খালি। বাস্তব তথ্য নির্ভরযোগ্য উৎস থেকে যাচাই না করে `verified` করবেন না।

## চালানো
1. ZIP Extract করুন।
2. GitHub-এ নতুন repository তৈরি করুন।
3. ZIP-এর ভেতরের ফাইলগুলো repository root-এ upload করুন।
4. Settings → Pages → Deploy from a branch → `main` / `root` নির্বাচন করুন।
5. প্রকাশিত HTTPS URL খুলুন। PWA ও Service Worker HTTPS বা localhost-এ কাজ করে।

স্থানীয়ভাবে পরীক্ষা করতে সাধারণ static server ব্যবহার করুন; `file://` দিয়ে খুললে fetch/Service Worker ঠিকমতো কাজ নাও করতে পারে।

## JSON ডেটা ফরম্যাট (সংক্ষিপ্ত)

### stops.json
```json
[
  {
    "id": "STOP001",
    "name_bn": "স্টপেজের নাম",
    "name_en": "Stop name",
    "area_id": "AREA001",
    "lat": null,
    "lon": null,
    "aliases": [],
    "status": "unverified",
    "source_ids": [],
    "last_verified": null
  }
]
```

### buses.json
```json
[
  {
    "id": "BUS001",
    "name_bn": "বাসের নাম",
    "name_en": "Bus name",
    "operator": "",
    "bus_type": "local",
    "status": "unverified",
    "source_ids": []
  }
]
```

### routes.json
```json
[
  {
    "route_id": "ROUTE001",
    "bus_id": "BUS001",
    "route_name_bn": "রুটের নাম",
    "route_name_en": "Route name",
    "direction": "outbound",
    "stops": ["STOP001", "STOP002"],
    "fare": {"amount": null, "currency": "BDT", "status": "unverified"},
    "status": "unverified",
    "source_ids": [],
    "last_verified": null
  }
]
```

### fares.json
```json
[
  {
    "id": "FARE001",
    "route_id": "ROUTE001",
    "from_stop_id": "STOP001",
    "to_stop_id": "STOP002",
    "amount": null,
    "currency": "BDT",
    "fare_type": "stage",
    "status": "unverified",
    "source_ids": [],
    "last_verified": null
  }
]
```

## Verification policy
- `verified`: নির্ভরযোগ্য উৎস ও যাচাইয়ের তারিখ আছে।
- `estimated`: হিসাব/অনুমান; নিশ্চিত ভাড়া নয়।
- `unverified`: যাচাই হয়নি; নিশ্চিত ফলাফলে দেখাবেন না।
- উৎস, তারিখ, পদ্ধতি ও দায়িত্বপ্রাপ্ত যাচাইকারীর নোট রাখুন।

## বর্তমান সীমাবদ্ধতা
- সার্চে বর্তমানে যাচাইকৃত direct route খোঁজার প্রাথমিক কাঠামো আছে; multi-transfer graph search পরবর্তী ডেভেলপমেন্ট।
- ম্যাপ প্যানেল placeholder; বাস্তব map integration পরবর্তী ধাপ।
- Favourite UI কাঠামো প্রস্তুত; favourite যোগ করার নিয়ন্ত্রণ পরবর্তী ধাপ।
- JSON import/export প্রাথমিক; import ডেটা লোকাল স্টোরেজে staging করে।
- রিপোর্ট ডিভাইসের Local Storage-এ থাকে, স্বয়ংক্রিয়ভাবে সার্ভারে যায় না।
- Offline-এ অ্যাপ shell ও JSON cache হবে; প্রথমবার অনলাইনে খুলে cache তৈরি করতে হবে।
- Live traffic / live bus tracking নেই।
- Google Fonts অনলাইনে লোড হয়; সম্পূর্ণ offline typography-এর জন্য font asset স্থানীয়ভাবে যোগ করুন।

## নিরাপত্তা ও রক্ষণাবেক্ষণ
- JSON import-কে সরাসরি production data ধরে নেবেন না; review ও validation করে তারপর repository-তে commit করুন।
- জরুরি নম্বর প্রকাশের আগে সরকারি/বিশ্বস্ত উৎসে পুনরায় যাচাই করুন।
- Data update করলে `service-worker.js`-এর CACHE version বাড়ান, যেমন `dbjp-shell-v2`।
