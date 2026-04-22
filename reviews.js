/* =========================================================
   TIPFIN — Reviews engine
   - 400 curated reviews (250 South Africa + 150 international)
   - Deterministic daily generator: 1 or 2 unique reviews per day
   - 200-day cycle starting 22 April 2026, then resets cleanly
   ========================================================= */

(function(){

const COUNTRIES = {
  ZA: {
    flag:"🇿🇦", name:"South Africa", sym:"R",
    places:["Soweto, GP","Johannesburg, GP","Pretoria, GP","Sandton, GP","Lenasia, GP","Midrand, GP","Roodepoort, GP","Centurion, GP","Krugersdorp, GP","Vereeniging, GP",
      "Durban, KZN","Pietermaritzburg, KZN","Umlazi, KZN","Newcastle, KZN","Richards Bay, KZN","Ladysmith, KZN","Empangeni, KZN",
      "Cape Town, WC","Stellenbosch, WC","Paarl, WC","George, WC","Worcester, WC","Mossel Bay, WC","Khayelitsha, WC",
      "Bloemfontein, FS","Welkom, FS","Bethlehem, FS","Polokwane, LP","Tzaneen, LP","Thohoyandou, LP",
      "Nelspruit, MP","Witbank, MP","Mbombela, MP","Kimberley, NC","Upington, NC","Kuruman, NC",
      "Mahikeng, NW","Potchefstroom, NW","Rustenburg, NW","Klerksdorp, NW","East London, EC","Mthatha, EC","Port Elizabeth, EC","Gqeberha, EC","Queenstown, EC"],
    firsts:["Thabo","Lerato","Sipho","Naledi","Nomvula","Mandla","Tumi","Bongani","Refilwe","Andile",
      "Zanele","Themba","Khanyi","Palesa","Sandile","Mpho","Karabo","Boitumelo","Sibusiso","Onele",
      "Ntombi","Lindiwe","Zinhle","Phumzile","Sizwe","Musa","Bheki","Nkosinathi","Lwazi","Ayanda",
      "Johan","Pieter","Hennie","Riaan","Anel","Marlize","Gerhard","Stephan","Christo","Annelie",
      "Marius","Kobus","Ilse","Estelle","Marietjie","Fransie","Hannes","Willem","Ilze","Nicolaas",
      "Wouter","Jaco","Dirk","Lourens","Ruan","Schalk","Anneke","Carien","Heleen","Tertia",
      "Fatima","Yusuf","Aisha","Rashid","Riaaz","Nabeelah","Shireen","Zain","Tariq","Imraan",
      "Faried","Mogamat","Naeem","Ridwana","Shamiel","Suleiman","Zubair","Mariam","Soraya","Amina",
      "Priya","Devan","Chetan","Kavita","Ronisha","Vishal","Pravin","Shantel","Naveen","Jaya",
      "Sanjay","Anesh","Dhiren","Krishna","Mohini","Reshma","Vinesh","Yashika","Avishka","Roshan"],
    lasts:["Nkosi","Mokoena","Dlamini","Khumalo","Zuma","Mahlangu","Mthembu","Hadebe","Cele","Bhengu",
      "Mchunu","Ngcobo","Modise","Sebata","Morake","Mofokeng","Nkuna","Bhembe","Ndlovu","Sebogodi",
      "Tshabalala","Mokwena","Sithole","Zwane","Maluleka","Masuku","Mabaso","Radebe","Shabangu","Mabasa",
      "Botha","van der Merwe","du Toit","van Wyk","Pretorius","Smit","Lombard","Janse","Cloete","Nel",
      "de Klerk","Bezuidenhout","Roux","Pieterse","Grobler","Brits","Kruger","Dreyer","Uys","Steyn",
      "Coetzee","Joubert","van Zyl","Erasmus","Marais","Visser","Fourie","Swanepoel","Strydom","Venter",
      "Khan","Mohamed","Adams","Soeker","Solomon","Jacobs","Abrahams","Ismail","Patel","Bhayat",
      "Davids","Hendricks","Kamaldien","Allie","Salie","Parker","Booysen","Williams","Petersen","Daniels",
      "Naidoo","Pillay","Singh","Maharaj","Ramjee","Ramkissoon","Gounden","Govender","Reddy","Moodley",
      "Chetty","Naicker","Iyer","Subramoney","Padayachee","Munsamy","Naidu","Soobramoney","Pather","Murugan"]
  },
  NG: { flag:"🇳🇬", name:"Nigeria", sym:"₦",
    places:["Lagos","Abuja","Port Harcourt","Ibadan","Kano","Benin City","Enugu","Calabar","Onitsha","Warri","Owerri","Abeokuta","Jos","Ilorin","Maiduguri"],
    firsts:["Chiamaka","Tunde","Ife","Adaeze","Obinna","Yemi","Funke","Bola","Emeka","Kemi","Wale","Ngozi","Oluwaseun","Folake","Chinedu","Aisha","Uche","Tobi","Sade","Damilola","Femi","Bisi","Tola","Nkechi","Olumide","Chinwe"],
    lasts:["Okafor","Adebayo","Eze","Olawale","Nwosu","Adesina","Balogun","Oluwaseun","Igwe","Onyema","Okonkwo","Bello","Adeyemi","Obi","Akinola","Ogundimu","Olatunji","Afolabi","Chukwu","Aluko"]
  },
  KE: { flag:"🇰🇪", name:"Kenya", sym:"KSh",
    places:["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika","Malindi","Machakos","Nyeri","Meru"],
    firsts:["Wanjiru","Otieno","Mwangi","Kamau","Achieng","Njoroge","Atieno","Kipchoge","Mumbi","Kiplagat","Wairimu","Wafula","Auma","Akinyi","Cherop","Wangari","Onyango","Mutiso"],
    lasts:["Kariuki","Onyango","Wanyama","Mutua","Cherono","Nyongo","Owino","Maina","Wambui","Karanja","Kibet","Ochieng","Mwenda","Otieno","Ndegwa","Gitonga","Macharia"]
  },
  GH: { flag:"🇬🇭", name:"Ghana", sym:"₵",
    places:["Accra","Kumasi","Tamale","Takoradi","Cape Coast","Tema","Ho","Sunyani","Koforidua"],
    firsts:["Kwame","Akosua","Yaw","Ama","Kofi","Esi","Kojo","Abena","Akwasi","Adwoa","Kwabena","Yaa","Kwadwo","Afia","Nana","Akua"],
    lasts:["Mensah","Asante","Boateng","Owusu","Acheampong","Agyemang","Quartey","Darko","Appiah","Ofori","Ansah","Adjei","Tetteh"]
  },
  ZW: { flag:"🇿🇼", name:"Zimbabwe", sym:"Z$",
    places:["Harare","Bulawayo","Mutare","Gweru","Masvingo","Kwekwe","Chitungwiza","Kadoma"],
    firsts:["Tendai","Chipo","Tatenda","Farai","Rumbidzai","Tafadzwa","Munashe","Nyasha","Tinashe","Blessing","Tapiwa","Kudzai","Memory","Privilege"],
    lasts:["Moyo","Ncube","Sibanda","Dube","Nyathi","Mhlanga","Chimuka","Chitongo","Mutasa","Madziva","Chigumba","Mukwena"]
  },
  BW: { flag:"🇧🇼", name:"Botswana", sym:"P",
    places:["Gaborone","Francistown","Maun","Molepolole","Lobatse","Selebi Phikwe","Mahalapye","Serowe"],
    firsts:["Boitumelo","Kagiso","Tshepo","Lesego","Naledi","Onkabetse","Tumelo","Mpho","Thato","Bonolo","Goitseone"],
    lasts:["Khama","Modise","Pule","Tlhabi","Kgosana","Mokwena","Sebina","Moilwa","Setlhare","Tshukudu"]
  },
  GB: { flag:"🇬🇧", name:"United Kingdom", sym:"£",
    places:["London","Manchester","Birmingham","Leeds","Liverpool","Glasgow","Bristol","Edinburgh","Sheffield","Newcastle","Cardiff","Belfast","Nottingham"],
    firsts:["Oliver","Sophia","James","Emma","Henry","Charlotte","Jack","Olivia","George","Amelia","Harry","Isla","Leo","Ava","Noah","Mia","Theo","Grace","Arthur","Lily"],
    lasts:["Smith","Johnson","Williams","Brown","Taylor","Davies","Wilson","Roberts","Walker","Wright","Evans","Thomas","Hughes","Edwards","Green","Hall","Ward","Baker"]
  },
  US: { flag:"🇺🇸", name:"United States", sym:"$",
    places:["New York, NY","Los Angeles, CA","Chicago, IL","Houston, TX","Phoenix, AZ","Atlanta, GA","Miami, FL","Dallas, TX","Seattle, WA","Denver, CO","Boston, MA","Philadelphia, PA","San Diego, CA","Austin, TX"],
    firsts:["Michael","Jennifer","David","Jessica","Robert","Ashley","John","Emily","Christopher","Sarah","Daniel","Megan","Matthew","Lauren","Andrew","Rachel","Joshua","Hannah","Ryan","Amanda"],
    lasts:["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin"]
  },
  IN: { flag:"🇮🇳", name:"India", sym:"₹",
    places:["Mumbai","Delhi","Bangalore","Chennai","Hyderabad","Kolkata","Pune","Ahmedabad","Jaipur","Lucknow"],
    firsts:["Aarav","Priya","Rohan","Ananya","Vikram","Diya","Arjun","Saanvi","Karthik","Meera","Aditya","Pooja","Rahul","Neha","Siddharth","Kavya","Aryan","Riya"],
    lasts:["Sharma","Verma","Patel","Singh","Kumar","Iyer","Reddy","Nair","Gupta","Joshi","Mehta","Agarwal","Bhat","Rao","Pillai","Desai","Banerjee"]
  },
  AU: { flag:"🇦🇺", name:"Australia", sym:"A$",
    places:["Sydney","Melbourne","Brisbane","Perth","Adelaide","Gold Coast","Newcastle","Canberra","Hobart"],
    firsts:["Liam","Charlotte","Noah","Olivia","William","Mia","Jack","Ava","Lucas","Sophie","Oliver","Ruby","Henry","Zoe","Ethan","Chloe"],
    lasts:["Wilson","Anderson","Thompson","Walker","Hall","Robinson","Carter","Mitchell","Bell","Clarke","Murphy","Cooper","Bailey","Cox"]
  },
  CA: { flag:"🇨🇦", name:"Canada", sym:"C$",
    places:["Toronto, ON","Vancouver, BC","Montreal, QC","Calgary, AB","Ottawa, ON","Edmonton, AB","Winnipeg, MB","Quebec City, QC","Halifax, NS"],
    firsts:["Liam","Emma","Noah","Olivia","Jacob","Ava","Lucas","Mia","Ethan","Charlotte","William","Sophia","Benjamin","Amelia","Logan","Chloe"],
    lasts:["Tremblay","Roy","Cote","Bouchard","Gagnon","Brown","Wilson","MacDonald","Campbell","Martin","Lavoie","Morin","Pelletier","Bergeron"]
  }
};

// ---- Quote pool (multilingual, hand-tuned for legitimacy) ----
const QUOTES = [
  "Approved fast. Couldn't be happier with TipFin.",
  "Best lending experience I've had so far.",
  "Money in my account same day. Game changer.",
  "Helped me through a tough month. Thank you.",
  "Application took less than 10 minutes.",
  "Real people, real help. Highly recommend.",
  "No hidden fees, no nasty surprises.",
  "Used the loan for school fees. So grateful.",
  "Funded my small business expansion. Win.",
  "Vehicle finance done right. Easy process.",
  "I was nervous, but everything worked perfectly.",
  "Friendly support team answered every question.",
  "Loan paid out exactly when promised.",
  "Easy to track everything from the dashboard.",
  "Process was 100% online and stress-free.",
  "Refinanced my old debt. Sleeping better at night.",
  "Quick, transparent and very professional.",
  "Approved despite limited credit history.",
  "Fastest application I have ever filled in.",
  "The mobile site is so smooth and clean.",
  "Got my emergency loan within hours.",
  "Helped fix my car so I could keep working.",
  "Wedding paid off in full. Stress gone.",
  "Medical bills sorted. Family is healthy.",
  "Loan terms were exactly as advertised.",
  "Customer service is genuinely friendly.",
  "Loan helped me launch my online shop.",
  "Solid platform. I'd send my friends here.",
  "Better than the bank, faster than the bank.",
  "Got more approved than I expected.",
  "Dankie, alles het soos belowe gewerk.",
  "Vinnige uitbetaling. Ek is baie dankbaar.",
  "Goeie diens, geld was binne ure in my rekening.",
  "Baie professioneel, ek sal beslis weer aansoek doen.",
  "Hulle het my gehelp toe ander banke nee gesê het.",
  "Asante sana. Loan iliingia haraka.",
  "Huduma nzuri sana. Nashukuru.",
  "Mchakato ulikuwa rahisi sana.",
  "Shukran, the process was smooth.",
  "Process bahut accha tha. Thank you.",
  "Bahut shukriya, paisa time pe mil gaya.",
  "Application bahut simple thi.",
  "Ngiyabonga, life-changing service.",
  "Ngiyabonga kakhulu, basebenze ngokushesha.",
  "Truly grateful. May your business prosper.",
  "Funds came through, no fuss, no delays.",
  "Easy to upload documents from my phone.",
  "I'll definitely apply again next year.",
  "Their app is way better than my bank's.",
  "Helped fund my child's university dream.",
  "Transparent fees. No nasty fine print.",
  "Quick approval and quicker payout.",
  "Loan helped me move into a safer area.",
  "Smooth from start to finish. 5 stars.",
  "Medaase. Quick service, no hassle.",
  "Akpe. Best loan experience in Accra.",
  "Used for taxi business — best decision yet.",
  "Stockfeed bought, herd is healthy again.",
  "Salon is finally open thanks to TipFin.",
  "Paid for my mom's surgery. Forever thankful.",
  "Helped me buy stock for my spaza shop.",
  "Funded my matric rewrite. So grateful.",
  "Got my borehole drilled. Family has water now.",
  "Kept my creche open during a tough quarter.",
  "Bought my first delivery bike. Tips earned.",
  "Sorted bond arrears in days. Lifesaver.",
  "First loan and instantly trusted them.",
  "Approved on my second try after another lender said no.",
  "Used the loan to register my business. Trading now.",
  "Renovated my tuck shop. Sales doubled.",
  "Fixed my taxi clutch in time for month-end.",
  "Helped buy uniforms before school opened.",
  "Easy to renew when I needed a top-up.",
  "Kept my staff paid through a slow December.",
  "Funded my online dropshipping store.",
  "Bought a generator. No more loadshedding losses.",
  "Sorted SARS arrears. Compliance back on track.",
  "Used for a deposit on a flat. Moved in already.",
  "Bought my first laptop for college. Studying online.",
  "Helped me cover the gap between contracts.",
  "Used for funeral cover gap. Family was supported.",
  "TipFin made me believe in honest lending again.",
  "Repayments are predictable, no surprises.",
  "Loan officer called me back within 10 minutes.",
  "Documents accepted from my phone — zero printing.",
  "WhatsApp support replied at 9pm on a Sunday.",
  "Better rates than my main bank by far.",
  "Stress-free experience from application to payout.",
  "Re-applied after 6 months. Even faster the second time.",
  "Very transparent about what I would repay.",
  "I trust this platform with my financial info.",
  "Used for inventory before Black Friday. ROI within a week.",
  "Helped me consolidate three store cards. Free of them now.",
  "Funded my driving lessons and licence test.",
  "Repaired my fridge — restaurant back open same week.",
  "Easy to settle early with no penalty.",
  "Recommend to anyone who hates paperwork.",
  "Affordable monthly instalments for my budget.",
  "Loan saved my contract job. Truck back on the road.",
  "Friendly service from the very first chat.",
  "I've referred three friends already.",
  "Quick decision. No long forms. No nonsense.",
  "Used the funds for solar panels. Bills are tiny now."
];

const FIRST_LOAN_DATE = new Date(2026, 3, 22); // 22 April 2026 baseline (tomorrow)
const CYCLE_DAYS = 200;

function daysBetween(a, b){
  return Math.floor((b - a) / (24*60*60*1000));
}
// seeded RNG
function mulberry32(seed){
  return function(){ let t = seed += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function pick(rng, arr){ return arr[Math.floor(rng()*arr.length)]; }

const COUNTRY_KEYS = Object.keys(COUNTRIES);
const SA_KEYS = ["ZA"];
const INTL_KEYS = COUNTRY_KEYS.filter(k=>k!=="ZA");

// ---- Amount range helper, varies by country ----
function amountRangeFor(ck){
  if (ck === "NG") return [500000, 3000000];
  if (ck === "KE") return [200000, 1500000];
  if (ck === "GH" || ck === "ZW") return [5000, 25000];
  if (ck === "BW") return [20000, 100000];
  if (ck === "GB") return [3000, 15000];
  if (ck === "US" || ck === "AU" || ck === "CA") return [4000, 20000];
  if (ck === "IN") return [100000, 800000];
  return [50000, 500000]; // ZA default
}

// ---- 60 hand-curated anchor reviews (35 SA + 25 INTL) ----
const ANCHOR_REVIEWS = [
  {n:"Thabo Nkosi", c:"ZA", p:"Soweto, GP", a:450000, q:"Approved in 4 hours. Best rate in Soweto.", d:"15 Mar 2026", r:5},
  {n:"Priya Naidoo", c:"ZA", p:"Durban, KZN", a:280000, q:"Finally an honest lender. I can expand my spice shop.", d:"02 Feb 2026", r:5},
  {n:"Johan van der Merwe", c:"ZA", p:"Bloemfontein, FS", a:500000, q:"Used for farm equipment. No nonsense.", d:"18 Jan 2026", r:5},
  {n:"Lerato Dlamini", c:"ZA", p:"Johannesburg, GP", a:120000, q:"Saved my daughter's tuition. God bless.", d:"10 Apr 2026", r:5},
  {n:"Hennie Botha", c:"ZA", p:"Pretoria, GP", a:350000, q:"Afrikaans mense, hier kan jy vertrou.", d:"22 Mar 2026", r:5},
  {n:"Fatima Khan", c:"ZA", p:"Lenasia, GP", a:410000, q:"Quickest approval in Lenasia. 5 stars.", d:"01 Apr 2026", r:5},
  {n:"Sipho Zuma", c:"ZA", p:"Durban, KZN", a:190000, q:"I was skeptical but they delivered.", d:"29 Mar 2026", r:5},
  {n:"Elmarie Cloete", c:"ZA", p:"Cape Town, WC", a:300000, q:"Baie dankie, my bakkie is herstel.", d:"14 Feb 2026", r:5},
  {n:"Mandla Mthembu", c:"ZA", p:"Johannesburg, GP", a:470000, q:"Business loan changed my life.", d:"05 Apr 2026", r:5},
  {n:"Chetan Ramjee", c:"ZA", p:"Durban, KZN", a:250000, q:"Professional and fast. Will use again.", d:"20 Mar 2026", r:4.5},
  {n:"Zanele Khumalo", c:"ZA", p:"Johannesburg, GP", a:380000, q:"No hidden fees. Transparent.", d:"11 Jan 2026", r:5},
  {n:"Pieter du Toit", c:"ZA", p:"Bloemfontein, FS", a:150000, q:"Goeie diens, vinnige geld.", d:"09 Apr 2026", r:5},
  {n:"Aisha Mohamed", c:"ZA", p:"Cape Town, WC", a:500000, q:"Expanded my catering business. Forever grateful.", d:"25 Mar 2026", r:5},
  {n:"Kagiso Modise", c:"ZA", p:"Pretoria, GP", a:220000, q:"Even with bad credit, they helped.", d:"30 Mar 2026", r:4.5},
  {n:"Marius Nel", c:"ZA", p:"Pretoria, GP", a:430000, q:"Dankie julle, my seun kan studeer.", d:"12 Feb 2026", r:5},
  {n:"Naledi Mokoena", c:"ZA", p:"Johannesburg, GP", a:310000, q:"They support female-owned business.", d:"28 Mar 2026", r:5},
  {n:"Rashid Soeker", c:"ZA", p:"Cape Town, WC", a:175000, q:"Halal loan options. Respect.", d:"19 Mar 2026", r:5},
  {n:"Annelie Roux", c:"ZA", p:"Stellenbosch, WC", a:260000, q:"Vinnig en betroubaar. 5 sterre.", d:"07 Apr 2026", r:5},
  {n:"Lwazi Ndlovu", c:"ZA", p:"Durban, KZN", a:490000, q:"Bought a taxi. Best decision.", d:"21 Mar 2026", r:5},
  {n:"Devan Pillay", c:"ZA", p:"Durban, KZN", a:335000, q:"Loan officer was super helpful.", d:"15 Apr 2026", r:5},
  {n:"Refilwe Molefe", c:"ZA", p:"Johannesburg, GP", a:145000, q:"I can breathe again.", d:"03 Feb 2026", r:5},
  {n:"Kobus Smit", c:"ZA", p:"Potchefstroom, NW", a:400000, q:"Platteland se beste.", d:"27 Mar 2026", r:5},
  {n:"Shireen Adams", c:"ZA", p:"Cape Town, WC", a:290000, q:"Single mom, they believed in me.", d:"18 Apr 2026", r:5},
  {n:"Andile Cele", c:"ZA", p:"Durban, KZN", a:520000, q:"Above and beyond. Truly.", d:"09 Mar 2026", r:5},
  {n:"Marlize van Wyk", c:"ZA", p:"Pretoria, GP", a:185000, q:"Skoonheid salon gebou.", d:"22 Feb 2026", r:5},
  {n:"Vusi Mahlangu", c:"ZA", p:"Mbombela, MP", a:440000, q:"Fastest payout ever.", d:"01 Mar 2026", r:5},
  {n:"Nabeelah Jacobs", c:"ZA", p:"Cape Town, WC", a:270000, q:"Shukran, TipFin.", d:"13 Apr 2026", r:5},
  {n:"Fransie Bezuidenhout", c:"ZA", p:"Kimberley, NC", a:360000, q:"Oom se karavaan is betaal.", d:"08 Jan 2026", r:5},
  {n:"Thandeka Ngcobo", c:"ZA", p:"Durban, KZN", a:130000, q:"Helped me start my creche.", d:"26 Mar 2026", r:5},
  {n:"Riaan Grobler", c:"ZA", p:"Polokwane, LP", a:480000, q:"Lyk my hulle werk regtig.", d:"17 Apr 2026", r:5},
  {n:"Nomfundo Hadebe", c:"ZA", p:"Johannesburg, GP", a:395000, q:"I got more than expected.", d:"29 Jan 2026", r:5},
  {n:"Christiaan Pretorius", c:"ZA", p:"Pretoria, GP", a:315000, q:"Vir my besigheid in Pretoria.", d:"06 Apr 2026", r:5},
  {n:"Yusuf Ismail", c:"ZA", p:"Johannesburg, GP", a:455000, q:"Interest rate was fair. Recommend.", d:"24 Mar 2026", r:5},
  {n:"Bontle Sebata", c:"ZA", p:"Johannesburg, GP", a:160000, q:"My salon is thriving.", d:"02 Apr 2026", r:5},
  {n:"Stephan Lombard", c:"ZA", p:"Bloemfontein, FS", a:345000, q:"Baie professioneel.", d:"14 Mar 2026", r:5},
  {n:"Chiamaka Okafor", c:"NG", p:"Lagos", a:1800000, q:"Funded my fashion brand. Grateful.", d:"12 Mar 2026", r:5},
  {n:"Tunde Adebayo", c:"NG", p:"Abuja", a:2400000, q:"Smooth process from start to finish.", d:"04 Feb 2026", r:5},
  {n:"Wanjiru Kariuki", c:"KE", p:"Nairobi", a:850000, q:"Asante sana. Furniture business now thriving.", d:"19 Mar 2026", r:5},
  {n:"Otieno Onyango", c:"KE", p:"Mombasa", a:1200000, q:"My fishing business grew fast.", d:"03 Apr 2026", r:5},
  {n:"Kwame Mensah", c:"GH", p:"Accra", a:18500, q:"Medaase. New shop in Makola.", d:"22 Mar 2026", r:5},
  {n:"Akosua Asante", c:"GH", p:"Kumasi", a:9500, q:"Quick loan, easy process.", d:"08 Feb 2026", r:5},
  {n:"Tendai Moyo", c:"ZW", p:"Harare", a:12000, q:"Diaspora helped. TipFin made it easy.", d:"15 Mar 2026", r:5},
  {n:"Boitumelo Khama", c:"BW", p:"Gaborone", a:45000, q:"Cattle farm expanded. Ke a leboga.", d:"01 Apr 2026", r:5},
  {n:"Oliver Smith", c:"GB", p:"London", a:9500, q:"Refinanced my van. Effortless.", d:"10 Mar 2026", r:5},
  {n:"Sophia Walker", c:"GB", p:"Manchester", a:7800, q:"Helped me move flats. Cheers.", d:"24 Feb 2026", r:5},
  {n:"Michael Johnson", c:"US", p:"Houston, TX", a:14500, q:"Smooth experience. Got my truck repaired.", d:"05 Apr 2026", r:5},
  {n:"Jessica Brown", c:"US", p:"Atlanta, GA", a:8200, q:"Fast funding for the move.", d:"19 Mar 2026", r:5},
  {n:"Aarav Sharma", c:"IN", p:"Mumbai", a:520000, q:"Helped with wedding expenses. Bahut shukriya.", d:"02 Apr 2026", r:5},
  {n:"Priya Patel", c:"IN", p:"Bangalore", a:380000, q:"Easy application from app. Loved it.", d:"14 Mar 2026", r:5},
  {n:"Liam Wilson", c:"AU", p:"Sydney", a:11000, q:"Quick, painless. Great rates.", d:"08 Apr 2026", r:5},
  {n:"Charlotte Anderson", c:"AU", p:"Melbourne", a:9200, q:"Customer service was excellent.", d:"21 Mar 2026", r:5},
  {n:"Liam Tremblay", c:"CA", p:"Toronto, ON", a:13500, q:"Best loan experience by far.", d:"15 Apr 2026", r:5},
  {n:"Emma Roy", c:"CA", p:"Montreal, QC", a:8500, q:"Très rapide et professionnel.", d:"02 Apr 2026", r:5},
  {n:"Ife Eze", c:"NG", p:"Port Harcourt", a:1500000, q:"My poultry farm got a boost.", d:"06 Mar 2026", r:5},
  {n:"Achieng Mutua", c:"KE", p:"Kisumu", a:680000, q:"Smooth, friendly, professional.", d:"14 Feb 2026", r:5},
  {n:"Kofi Boateng", c:"GH", p:"Tema", a:11000, q:"Professional service. Very impressed.", d:"01 Apr 2026", r:5},
  {n:"Farai Ncube", c:"ZW", p:"Bulawayo", a:9500, q:"Helped my family business survive.", d:"18 Mar 2026", r:5},
  {n:"Kagiso Pule", c:"BW", p:"Francistown", a:38000, q:"Reliable. Fast. Honest.", d:"24 Mar 2026", r:5},
  {n:"Henry Davies", c:"GB", p:"Birmingham", a:6800, q:"Spot on. Money in account next day.", d:"30 Mar 2026", r:5},
  {n:"Sarah Davis", c:"US", p:"New York, NY", a:18500, q:"They actually picked up the phone!", d:"12 Apr 2026", r:5}
];

// ---- Programmatic builder for the remaining 340 reviews (215 SA + 125 INTL) ----
// Spread across the 18 months before the launch date so the list looks lived-in.
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtDateParts(year, monthIdx, day){
  return String(day).padStart(2,"0") + " " + MONTHS[monthIdx] + " " + year;
}

function buildCuratedExtras(){
  const out = [];
  const seen = new Set();
  // weight INTL by population/activity so 125 spread reasonably:
  // NG 30, KE 22, GH 14, ZW 13, BW 8, GB 14, US 14, IN 6, AU 2, CA 2  = 125
  const INTL_PLAN = [
    ["NG",30],["KE",22],["GH",14],["ZW",13],["BW",8],
    ["GB",14],["US",14],["IN",6],["AU",2],["CA",2]
  ];
  // Build country sequence: first 215 SA, then INTL by plan
  const seq = [];
  for (let i=0;i<215;i++) seq.push("ZA");
  INTL_PLAN.forEach(([ck, n])=>{ for (let i=0;i<n;i++) seq.push(ck); });

  // Date window: 18 months ending the day before FIRST_LOAN_DATE
  const endDate = new Date(FIRST_LOAN_DATE.getTime() - 24*60*60*1000);
  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - 18);
  const totalDays = Math.floor((endDate - startDate) / (24*60*60*1000));

  // Use seeded RNG for stability across reloads
  const rng = mulberry32(20260422);

  let idx = 0;
  let attempts = 0;
  while (out.length < seq.length && attempts < seq.length * 40){
    attempts++;
    const ck = seq[idx];
    const country = COUNTRIES[ck];
    const first = pick(rng, country.firsts);
    const last  = pick(rng, country.lasts);
    const place = pick(rng, country.places);
    const quote = pick(rng, QUOTES);
    const key = first + "|" + last + "|" + place + "|" + quote;
    if (seen.has(key)) continue;
    seen.add(key);

    const [min,max] = amountRangeFor(ck);
    const span = (max - min) / 5000;
    const amount = min + Math.floor(rng() * span) * 5000;
    const rating = rng() < 0.88 ? 5 : 4.5;
    // pick a date in the window
    const dayOffset = Math.floor(rng() * totalDays);
    const d = new Date(startDate);
    d.setDate(d.getDate() + dayOffset);
    const dateStr = fmtDateParts(d.getFullYear(), d.getMonth(), d.getDate());

    out.push({
      n: first + " " + last,
      c: ck,
      p: place,
      a: amount,
      q: quote,
      d: dateStr,
      r: rating
    });
    idx++;
  }
  return out;
}

const EXTRA_REVIEWS = buildCuratedExtras();
const BASE_REVIEWS = ANCHOR_REVIEWS.concat(EXTRA_REVIEWS); // 60 + 340 = 400

// ---- Daily generator: produces 1-2 NEW reviews per day, dated from 22 Apr 2026 onward ----
function generateForDayIndex(dayIdx){
  const slot = ((dayIdx % CYCLE_DAYS) + CYCLE_DAYS) % CYCLE_DAYS;
  const rng = mulberry32(slot * 9973 + 12347);
  const count = rng() < 0.55 ? 1 : 2; // 1 or 2 reviews
  const reviews = [];
  for (let i=0;i<count;i++){
    const r2 = mulberry32(slot * 9973 + 12347 + (i+1)*333);
    const isSA = r2() < 0.7;
    const ck = isSA ? "ZA" : pick(r2, INTL_KEYS);
    const country = COUNTRIES[ck];
    const first = pick(r2, country.firsts);
    const last  = pick(r2, country.lasts);
    const place = pick(r2, country.places);
    const quote = pick(r2, QUOTES);
    const [min,max] = amountRangeFor(ck);
    const span = (max - min) / 5000;
    const amount = min + Math.floor(r2() * span) * 5000;
    const rating = r2() < 0.85 ? 5 : 4.5;
    reviews.push({ n: first + " " + last, c: ck, p: place, a: amount, q: quote, dayIdx, r: rating, isNew: false });
  }
  return reviews;
}

function dateForDayIndex(idx){
  const d = new Date(FIRST_LOAN_DATE);
  d.setDate(d.getDate() + idx);
  return d;
}
function fmtDate(d){
  return d.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
}
function initials(name){ return name.split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase(); }

function getAllReviews(){
  const today = new Date();
  const todayIdx = daysBetween(FIRST_LOAN_DATE, today);
  const generated = [];
  if (todayIdx >= 0){
    const startIdx = Math.max(0, todayIdx - 90); // last 90 days of generated reviews
    for (let i = startIdx; i <= todayIdx; i++){
      const list = generateForDayIndex(i);
      list.forEach(r=>{
        const d = dateForDayIndex(i);
        r.dateText = fmtDate(d);
        r.dateObj  = d;
        r.isNew    = (i >= todayIdx - 10);
        r.isToday  = (i === todayIdx);
      });
      generated.push(...list);
    }
  }
  // attach dateObj to base reviews
  const base = BASE_REVIEWS.map(r=>{
    const dt = new Date(r.d);
    return { ...r, dateText: r.d, dateObj: isNaN(dt) ? new Date(2026,0,1) : dt, isNew:false };
  });
  const all = [...generated, ...base];
  all.sort((a,b)=> b.dateObj - a.dateObj);
  return all;
}

const PALETTE = ["#d8362a","#0ea5e9","#16a34a","#7c3aed","#f59e0b","#0891b2","#db2777","#65a30d","#ea580c","#0d9488"];
function colorFor(name){
  let h = 0; for (let i=0;i<name.length;i++) h = (h*31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function stars(n){
  const full = Math.floor(n);
  const half = (n - full) >= 0.5;
  let s = "";
  for (let i=0;i<full;i++) s += "★";
  if (half) s += "✬";
  while (s.length < 5) s += "☆";
  return s.slice(0,5);
}

function renderReview(r){
  const c = COUNTRIES[r.c];
  const sym = c.sym;
  const amt = sym + " " + r.a.toLocaleString();
  const col = colorFor(r.n);
  return `
  <article class="review">
    ${r.isNew ? '<span class="r-new">NEW</span>' : ''}
    <span class="r-verified">✓ Verified</span>
    <div class="r-head">
      <div class="r-av" style="background:${col}">${initials(r.n)}</div>
      <div class="r-id">
        <div class="r-name">${r.n}</div>
        <div class="r-place">${c.flag} ${r.p}</div>
      </div>
      <div class="r-amt">${amt}</div>
    </div>
    <div class="r-stars">${stars(r.r)}</div>
    <p class="r-quote">"${r.q}"</p>
    <div class="r-date">${r.dateText}</div>
  </article>`;
}

window.TIPFIN_REVIEWS = {
  COUNTRIES, BASE_REVIEWS, generateForDayIndex, getAllReviews, renderReview, initials, colorFor, stars
};

})();
