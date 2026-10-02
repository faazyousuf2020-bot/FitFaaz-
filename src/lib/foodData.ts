// Built-in food table. Values are per 100 g (or 100 ml for drinks), cooked/as eaten,
// based on standard reference figures (IFCT 2017 / NIN India and USDA FoodData Central)
// for typical home or restaurant preparation.
// Format: name | aliases | kcal | protein | carbs | fat | fibre | portions (unit:grams, first = default)
export const FOOD_TABLE = `
# ---------- tiffin ----------
idli|idly,idlis,idlies,idlys,iddli,idli plain|135|4.5|28|0.5|1.2|pc:40,plate:80
rava idli|rava idly,rava idlis|170|4.5|25|5.5|1|pc:50
mini idli|button idli,mini idlis|135|4.5|28|0.5|1.2|pc:12,katori:100
sambar idli|sambar idly|105|3.5|18|2|2|pc:110,katori:200
plain dosa|dosa,dosai,thosai,dosas,dosais,plain dosai|170|3.9|28|4.5|1.2|pc:80,plate:80
masala dosa|masal dosa,masala dosai|180|3.5|26|7|2|pc:180
ghee roast|ghee roast dosa,ghee dosa,nei roast|260|4|30|13.5|1.2|pc:110
paper roast|paper dosa,paper roast dosa|220|4|30|9.5|1.2|pc:90
onion dosa|onion dosai,vengaya dosai|175|3.8|27|5.5|1.8|pc:110
rava dosa|rava dosai,rava masala dosa|200|4|28|8|1|pc:100
set dosa|sponge dosa|160|3.8|28|3.5|1.2|pc:60
neer dosa||150|2.5|30|2|0.5|pc:50
egg dosa|muttai dosa,egg dosai,muttai dosai|185|7|22|7.5|1|pc:130
podi dosa|gunpowder dosa,podi dosai|210|5|28|8.5|2|pc:100
cheese dosa||230|8|25|11|1|pc:130
uthappam|onion uthappam,uttapam,oothappam,uthapam,uttappam|160|4|25|5|2|pc:150
pesarattu|moong dosa,green gram dosa|160|7|22|5|3|pc:100
adai|adai dosa,adai dosai|190|7|25|7|3.5|pc:100
appam|appams,palappam,aapam|150|2.5|28|3|0.8|pc:60
idiyappam|string hoppers,idiappam,noolputtu,sevai,santhakai|150|2.5|33|0.5|0.8|pc:40,cup:120
lemon sevai|lemon idiyappam|170|2.8|31|4|1|cup:150,katori:150
puttu|rice puttu,puttu plain|170|3|35|2|1.5|cup:150,pc:150
ragi puttu|kezhvaragu puttu|160|3.5|32|2|4|cup:150
pongal|ven pongal,khara pongal,pongal ven|140|3.8|20|5|1|cup:200,katori:150,plate:250
sweet pongal|sakkarai pongal,chakkara pongal,chakkarai pongal|210|3|35|6.5|1|cup:200,katori:150
upma|rava upma,uppuma,uppittu,sooji upma|130|3|20|4.3|1.5|cup:200,katori:150,plate:250
semiya upma|vermicelli upma,semiya,sevai upma|135|3|22|4|1.5|cup:200,katori:150
rava kichadi|kichadi,kesari kichadi|140|3|21|5|1.5|cup:200,katori:150
khichdi|dal khichdi,khichri,kitchadi|120|4.5|20|2.5|2|cup:200,katori:150
poha|aval,aval upma,avalakki,kanda poha,beaten rice|160|3|27|4.5|1.5|cup:150,katori:120,plate:200
oats porridge|oatmeal,oats kanji,cooked oats,oats with water|70|2.5|12|1.4|1.7|cup:240,katori:200
masala oats||85|2.8|13|2.5|2|cup:240,katori:200,packet:240
oats|oats dry,raw oats,rolled oats,quaker oats|380|13|67|7|10|katori:40,cup:40,tbsp:10,scoop:40,g:1
cornflakes|corn flakes|378|7|84|0.9|3|cup:30,katori:30
muesli|granola|370|10|66|6|8|cup:50,katori:50
bread|white bread,bread slice,bread slices,sandwich bread|265|9|49|3.2|2.7|slice:28
brown bread|wheat bread,whole wheat bread,atta bread|250|10|43|3.5|6|slice:28
multigrain bread||260|11|43|4|7|slice:30
bread toast|toast,toasted bread|300|10|56|3.5|3|slice:25
butter toast|bread butter|360|8|47|15|2.5|slice:32
bread omelette|bread omlet,bread omelet|210|10|18|11|1|plate:150,pc:150
bread jam||280|6|56|3|2|slice:40
pidi kozhukattai|upma kozhukattai,kara kozhukattai|150|3|28|2.5|1.5|pc:40
kozhukattai|modak,modakam,sweet kozhukattai,poorana kozhukattai|220|3|38|6|2|pc:40
paniyaram|kuzhi paniyaram,paddu,kara paniyaram,gunta ponganalu|180|4|26|6.5|1.5|pc:20
sweet paniyaram|inippu paniyaram|230|3.5|38|7|1.2|pc:25
medu vada|vada,ulundu vadai,vadai,uzhunnu vada,vadas,ulundu vada,medhu vadai,urad vada|300|11|30|15.5|4|pc:40,plate:80
masala vada|paruppu vadai,dal vada,aama vadai,masal vadai,parupu vadai|310|11|28|17|5|pc:40
sambar vada|sambar vadai|170|6|17|8.5|3|pc:120
curd vada|thayir vadai,dahi vada,thayir vada,dahi bhalla|170|6|18|8|1.5|pc:120
rasam vada|rasa vadai|150|5|15|7.5|2.5|pc:120
keerai vadai|spinach vada|290|10|28|15.5|5|pc:40
bonda|aloo bonda,potato bonda,urulai bonda|260|5|30|13.5|2.5|pc:50
mysore bonda|mysore bajji,goli baje|290|6|35|14|1.5|pc:40
bajji|bhajji,vazhakkai bajji,raw banana bajji,plantain bajji|280|5|30|15.5|2.5|pc:30
onion pakoda|onion bajji,pakoda,pakora,onion pakora,vengaya bajji,vengaya pakoda,pakodas,pakoras|320|6|32|19|3|pc:25,cup:60,plate:120
chilli bajji|mirchi bajji,milagai bajji,mirchi bajji|250|5|25|14.5|3|pc:45
samosa|samosas,aloo samosa,veg samosa|310|5|33|17.5|3|pc:70
chicken samosa|meat samosa|300|11|26|17|1.5|pc:60
kachori|khasta kachori|400|8|42|22|4|pc:50
chapati|chapathi,roti,chapatis,chapathis,phulka,rotis,chappathi,chapatti,chappati,chapattis,phulkas|280|9|48|6|8|pc:40,plate:80
dry chapati|plain phulka,roti without oil,phulka without ghee|260|9.5|52|1.5|9|pc:35
ghee chapati|ghee roti,butter roti|320|8.5|47|11|7.5|pc:45
parotta|porotta,barotta,kerala parotta,malabar parotta,parottas,porottas,paratha kerala|330|7|45|13.5|2|pc:90,plate:180
veechu parotta|veechu porotta|330|7|45|13.5|2|pc:90
paratha|plain paratha,lachha paratha,laccha paratha|320|7|45|12.5|5|pc:80
aloo paratha|aloo parotta,potato paratha,aloo parantha|260|5.5|36|10.5|4|pc:130
gobi paratha|gobi parantha|240|6|33|9.5|4.5|pc:130
paneer paratha|paneer parantha|290|10|33|13|4|pc:130
methi paratha|methi thepla,thepla|300|8|42|11|6|pc:60
poori|puri,pooris,puris,poori masala,poori kizhangu|380|7|43|20|3|pc:30,plate:60
bhatura|batura,bhature,chole bhature|360|8|45|16.5|2|pc:80
naan|plain naan,nan|290|9|50|5.5|2|pc:90
butter naan|butter nan|320|8.5|50|9.5|2|pc:100
garlic naan|garlic nan|320|8.5|50|9.5|2|pc:100
tandoori roti|tandoori rotti,tandoor roti|265|9|52|2|5|pc:60
kulcha|amritsari kulcha|300|8|50|7|2|pc:90
rumali roti|roomali roti|260|8|50|2.5|2|pc:50
jowar roti|jolada rotti,bhakri,cholam roti,jowar bhakri|280|8|55|3|7|pc:50
ragi roti|ragi rotti,kezhvaragu adai|210|5.5|37|4.5|5|pc:70
akki roti|akki rotti,rice roti|230|4|38|7|2|pc:80
makki roti|makki di roti,corn roti|300|6|48|9.5|6|pc:70
pancake|pancakes|230|6|29|10|1|pc:60
waffle|waffles|290|8|33|14|1.5|pc:75
# ---------- rice ----------
white rice|rice,sadam,saadam,cooked rice,steamed rice,boiled rice,chawal,soru,ponni rice,plain rice,sona masoori|130|2.7|28|0.3|0.4|cup:160,katori:150,plate:250,ladle:80
brown rice|cooked brown rice|112|2.6|23.5|0.9|1.8|cup:160,katori:150,plate:250
red rice|matta rice,kerala rice,rosematta,kerala matta rice,red boiled rice|115|2.5|25|0.5|2|cup:160,katori:150,plate:250
jeera rice|cumin rice|160|3|28|4|0.8|cup:160,katori:150,plate:250
ghee rice|neychoru,nei choru,nei sadam|190|3|29|7|0.6|cup:160,katori:150,plate:250
curd rice|thayir sadam,thayir sadham,yogurt rice,dahi chawal,mosaru anna,thayir saadam|115|3|18|3.4|0.5|cup:200,katori:150,plate:300
lemon rice|elumichai sadam,chitranna,lemon sadam|165|3|28|4.5|1|cup:180,katori:150,plate:300
tamarind rice|puliyodharai,puliyogare,puli sadam,puliyodarai,pulihora,puli soru|180|3|29|6|1.5|cup:180,katori:150,plate:300
tomato rice|thakkali sadam,tomato bath,thakkali soru|160|3|27|4.5|1.2|cup:180,katori:150,plate:300
coconut rice|thengai sadam,coconut sadam|190|3|26|8.5|2|cup:180,katori:150,plate:300
sesame rice|ellu sadam,ellu saadam|210|4.5|27|9.5|2.5|cup:180,katori:150
vangi bath|brinjal rice,kathirikai sadam|160|3|26|5|2|cup:180,katori:150
sambar rice|sambar sadam,sambar saadam|125|3.5|20|3.5|2|cup:220,katori:200,plate:350
bisi bele bath|bisibele bath,bisibelebath,bisi bele baath|135|4|20|4.3|2.5|cup:220,katori:200,plate:350
rasam rice|rasam sadam,rasam saadam|105|2.5|20|1.5|0.8|cup:220,katori:200,plate:350
veg pulao|pulao,pulav,vegetable pulao,veg pulav|150|3|25|4.3|1.5|cup:180,katori:150,plate:300
peas pulao|matar pulao|155|3.5|25|4.5|2|cup:180,katori:150,plate:300
veg biryani|vegetable biryani,veg briyani,veg biriyani,vegetable briyani|160|3.5|25|5|2|cup:200,plate:350,katori:150
chicken biryani|biryani,briyani,chicken briyani,chicken biriyani,biriyani,chicken dum biryani|175|9|20|6.5|1|cup:200,plate:400,katori:150
mutton biryani|mutton briyani,mutton biriyani,goat biryani|195|9.5|19|9|1|cup:200,plate:400,katori:150
egg biryani|egg briyani,muttai biryani,egg biriyani|165|6.5|21|6|1|cup:200,plate:350,katori:150
fish biryani|fish briyani|170|9|20|6|0.8|cup:200,plate:350
prawn biryani|prawn briyani,shrimp biryani|170|8.5|20|6.3|0.8|cup:200,plate:350
dindigul biryani|seeraga samba biryani,thalappakatti biryani,ambur biryani|180|9|20|7|0.8|cup:200,plate:400
hyderabadi biryani|dum biryani,hyderabad biryani|180|9|20|7|1|cup:200,plate:400
paneer biryani|paneer briyani|180|6|22|7.5|1.5|cup:200,plate:350
mushroom biryani|mushroom briyani|155|4|24|5|2|cup:200,plate:350
kuska|plain biryani,biryani rice,kushka,empty biryani|165|3|25|6|1|cup:180,plate:300
fried rice|veg fried rice,vegetable fried rice|165|3.5|25|5.5|1.2|cup:180,plate:300,katori:150
chicken fried rice|chicken friedrice|180|8|22|6.5|1|cup:180,plate:300
egg fried rice|egg friedrice|175|6|23|6.5|1|cup:180,plate:300
schezwan fried rice|schezwan rice,szechuan fried rice|180|4|26|6.5|1.2|cup:180,plate:300
meals|south indian meals,full meals,thali,veg meals,lunch meals,unlimited meals,veg thali,saapadu,sapadu|120|3.5|18|3.8|2.5|plate:750
non veg meals|chicken meals,non veg thali,fish meals|140|6|17|5.3|2|plate:800
mini meals|mini thali|125|3.5|19|3.8|2.5|plate:450
rice kanji|kanji,rice porridge,congee,nombu kanji,ganji,kanji rice|45|1|9.5|0.3|0.3|cup:240,katori:200,glass:250
pazhaya sadam|pazhaya soru,fermented rice,old rice,neeragaram|60|1.3|13|0.2|0.4|cup:240,katori:200
# ---------- millets & grains ----------
ragi mudde|ragi,ragi ball,ragi kali,kezhvaragu kali,finger millet ball,ragi balls,ragi mudda,kali|110|2.4|24|0.5|2.6|ball:200,cup:200,katori:150
ragi flour|ragi powder,ragi maavu,ragi atta|328|7.2|72|1.3|11.5|g:1,tbsp:10,cup:120
ragi dosa|kezhvaragu dosai,ragi dosai|160|4|26|4.5|3.5|pc:80
ragi kanji|ragi malt,ragi koozh,ragi porridge,ragi java,kezhvaragu koozh,ragi ambli|55|1.3|11|0.6|1.2|glass:250,cup:240
ragi idli|kezhvaragu idli|130|4|26|1|3|pc:45
kambu koozh|kambu kanji,bajra porridge,pearl millet porridge,koozh,kambu kool|55|1.6|10.5|0.7|1.5|glass:250,cup:240
kambu dosa|bajra dosa,kambu dosai|170|4.5|25|5.5|3.5|pc:80
kambu sadam|kambu rice,bajra rice,kambu soru|120|3.5|22|1.5|3|cup:180,katori:150
millet pongal|thinai pongal,varagu pongal,samai pongal,kuthiraivali pongal|135|4|20|4.3|2.5|cup:200,katori:150
millet rice|thinai sadam,varagu sadam,samai sadam,kuthiraivali,foxtail millet,little millet,kodo millet,barnyard millet,cooked millet,millets|120|3.5|23|1.2|3|cup:160,katori:150
millet dosa|thinai dosa,varagu dosa,samai dosa|165|4|26|4.8|3|pc:80
quinoa|cooked quinoa|120|4.4|21|1.9|2.8|cup:185,katori:150
wheat flour|atta,godhumai maavu,whole wheat flour|340|12|69|1.7|11|g:1,cup:120,tbsp:8
rava|sooji,semolina,suji|360|12.7|73|1|3.9|g:1,cup:170,tbsp:10
maida|all purpose flour,refined flour|364|10|76|1|2.7|g:1,cup:125,tbsp:8
rice flour|arisi maavu|366|6|80|1.4|2.4|g:1,cup:160,tbsp:10
raw rice|uncooked rice|360|7|79|0.6|1.3|g:1,cup:185
broken wheat|dalia,godhumai rava,cracked wheat|110|3.5|22|0.8|3.5|cup:200,katori:150
wheat upma|godhumai rava upma,dalia upma|125|3.5|21|3|3.5|cup:200,katori:150
# ---------- noodles & pasta ----------
noodles|veg noodles,hakka noodles,chowmein,chow mein,veg hakka noodles|170|4|25|6|1.5|cup:180,plate:300
chicken noodles|chicken hakka noodles,chicken chowmein|180|8|22|6.5|1.2|cup:180,plate:300
egg noodles|egg hakka noodles|175|6.5|23|6.5|1.2|cup:180,plate:300
maggi|maggi noodles,instant noodles,top ramen,yippee,yippee noodles,ramen|440|9|60|17.5|3|packet:70,cup:70,katori:70,plate:105
pasta|white sauce pasta,red sauce pasta,penne pasta,penne,spaghetti|160|5|24|5|1.5|cup:200,plate:300
macaroni|mac and cheese|155|5|24|4.5|1.5|cup:200,plate:300
# ---------- dals & curries ----------
sambar|sambhar,sambaar,mixed veg sambar,drumstick sambar,arachuvitta sambar,vegetable sambar|65|3|9|2|2.5|katori:150,cup:200,ladle:60
rasam|saathamudu,chaaru,tomato rasam,milagu rasam,lemon rasam,paruppu rasam|30|1|4.5|1|0.8|katori:150,cup:200,glass:200,ladle:60
dal|paruppu,dal fry,dhal,toor dal,daal,dal tadka,arhar dal,moong dal,masoor dal,yellow dal,dal curry,parippu,parippu curry,paruppu kadayal|105|6|14|3|3|katori:150,cup:200,ladle:60
dal makhani|dal makni,maa ki dal,black dal|135|5.5|13|7|4|katori:150,cup:200
chana dal curry|kadalai paruppu curry,chana dal fry|130|7|16|4|5|katori:150,cup:200
paruppu usili|usili,beans usili,kothavarangai usili|170|7|12|10.5|4|katori:100,cup:150
rajma|rajma masala,rajma curry,kidney bean curry|120|6|16|3.5|5|katori:150,cup:200
chana masala|chole,channa masala,chickpea curry,chana curry,chole masala,channa curry|140|6.5|17|5|5|katori:150,cup:200
kadala curry|black chana curry,kondakadalai kuzhambu,kala chana curry|130|6|16|4.5|5|katori:150,cup:200
kootu|koottu,poricha kootu,chow chow kootu,pumpkin kootu,poosanikai kootu|75|3|9|3|2.5|katori:150,cup:200
keerai kootu|spinach kootu,keerai masiyal,palak dal,keerai,spinach dal,palak|80|4|8|3.5|3|katori:150,cup:200
poriyal|thoran,vegetable poriyal,beans poriyal,cabbage poriyal,carrot poriyal,vegetable fry,sabzi,sabji,beetroot poriyal,beans thoran,cabbage thoran,palya|90|2|8|5.5|3|katori:100,cup:150,tbsp:20
avial|aviyal|105|2|8|7.5|3|katori:150,cup:200
olan|olan curry|80|2.5|8|4.5|2.5|katori:150,cup:200
erissery|erisseri,pumpkin erissery|110|3|12|5.5|3|katori:150,cup:200
pulissery|kalan,moru kootan|75|2.5|6|4.5|1|katori:150,cup:200
theeyal|ulli theeyal|130|2|10|9.5|3|katori:100,cup:150
kurma|veg kurma,korma,vegetable kurma,veg korma,kuruma,mixed veg kurma|110|2.5|9|7|2.5|katori:150,cup:200,ladle:60
vatha kuzhambu|vathal kuzhambu,kara kuzhambu,puli kuzhambu,vathakuzhambu,kuzhambu|105|1.5|10|6.5|2|katori:100,ladle:60,cup:200
mor kuzhambu|more kuzhambu,moru curry,kadhi,mor kulambu|70|2.5|6|4|0.8|katori:150,cup:200,ladle:60
kadhi pakora|punjabi kadhi|115|3.5|9|7.5|1.2|katori:150,cup:200
vada curry|vadacurry|140|5|12|8|3|katori:150,cup:200
veg stew|stew,vegetable stew,ishtu,veg ishtu|90|1.8|8|5.8|2|katori:150,cup:200
paneer butter masala|paneer masala,paneer makhani,butter paneer,paneer butter|210|8|8|16.5|1.5|katori:150,cup:200
palak paneer|saag paneer,spinach paneer|150|7|6|11|2|katori:150,cup:200
kadai paneer|paneer kadai,paneer tikka masala,paneer kadhai|190|8.5|7|14.5|2|katori:150,cup:200
matar paneer|mutter paneer,peas paneer|160|7.5|8|11|2.5|katori:150,cup:200
paneer bhurji|paneer scramble|240|14|6|18|1|katori:100,cup:150
paneer tikka||240|15|6|17.5|1|pc:30,plate:150
chilli paneer|paneer chilli|230|10|12|16|1.5|katori:120,plate:200
malai kofta||190|5|11|14|2|katori:150,cup:200
dum aloo|aloo dum|130|2|14|7.5|2.5|katori:150,cup:200
aloo matar|aloo mutter|105|3|13|4.8|3|katori:150,cup:200
aloo gobi|aloo gobhi|95|2|10|5.5|2.5|katori:150,cup:200
baingan bharta|brinjal bharta|100|2|8|7|3.5|katori:150,cup:200
sarson ka saag|sarson saag|95|3|7|6.5|3.5|katori:150,cup:200
mushroom masala|mushroom curry,mushroom gravy|95|3|6|6.5|1.8|katori:150,cup:200
mushroom fry|mushroom pepper fry|120|3.5|7|9|2|katori:100,cup:150
gobi manchurian|cauliflower manchurian,gobi manjurian,gobi manchurian dry|190|3.5|20|11|2.5|katori:120,plate:200,cup:150
veg manchurian|vegetable manchurian,manchurian|170|3.5|18|9.5|2.5|katori:120,plate:200
gobi 65|cauliflower 65,gobi fry|210|4|22|12|3|katori:100,plate:150
potato fry|urulai roast,urulaikizhangu fry,aloo fry,potato roast,urulai fry,potato poriyal|160|2|20|8|2.5|katori:100,cup:150
bhindi fry|vendakkai poriyal,okra fry,ladies finger fry,vendakkai fry,bhindi masala|120|2|10|8|3.5|katori:100,cup:150
brinjal curry|kathirikai kuzhambu,ennai kathirikai,baingan masala,kathirikai curry,brinjal masala|110|1.8|8|8|3|katori:150,cup:200
mixed veg curry|veg curry,mixed vegetable,vegetable curry,mix veg,mixed veg|90|2.5|9|5|3|katori:150,cup:200
green peas masala|peas masala,matar masala,pattani kurma|120|5|12|5.5|4.5|katori:150,cup:200
soya chunks curry|meal maker curry,soya curry,meal maker|130|9|9|6.5|3|katori:150,cup:200
salna|chicken salna,parotta salna,empty salna,kurma salna|100|5|5|6.5|1|ladle:60,katori:150
# ---------- egg ----------
egg|boiled egg,eggs,boiled eggs,muttai,egg boiled,hard boiled egg,whole egg,anda,mutta|155|12.6|1.1|10.6|0|pc:50
egg white|egg whites,boiled egg white,white of egg|52|11|0.7|0.2|0|pc:33
egg yolk|egg yolks|320|16|3.6|27|0|pc:17
omelette|omelet,egg omelette,masala omelette,muttai omelette,omlet,omelettes,egg omlet,double omelette|180|10.5|2|15|0.3|pc:60
half boil|half boiled egg,bullseye,fried egg,sunny side up,egg fry,half fry,poached egg|195|13|1|15|0|pc:55
egg bhurji|scrambled eggs,egg podimas,muttai podimas,anda bhurji,scrambled egg,egg kalakki,kalakki|180|11|3|14|0.5|katori:100,cup:150,pc:55
egg curry|egg kuzhambu,egg masala,muttai kuzhambu,muttai curry,egg gravy,anda curry|135|7|5|9.5|1|katori:150,cup:200,pc:100
egg roast|mutta roast,egg roast kerala|160|7.5|6|11.5|1.5|pc:120,katori:150
# ---------- chicken, meat, fish ----------
chicken|chicken pieces,cooked chicken,chicken meat,kozhi|190|27|0|9|0|g:1,katori:100,pc:60
chicken curry|chicken kuzhambu,chicken gravy,chicken masala,kozhi kuzhambu,kozhi curry,chicken kulambu|150|13|4|9|1|katori:150,cup:200,pc:60
chicken chettinad|chettinad chicken,chicken pepper masala,pepper chicken,chicken milagu varuval|175|15|4|11|1.2|katori:150,cup:200
butter chicken|murgh makhani,chicken makhani,butter chicken masala|195|13|6|13.5|1|katori:150,cup:200
chicken tikka masala|chicken tikka gravy|165|13|6|10|1|katori:150,cup:200
kadai chicken|chicken kadai,kadhai chicken|170|14|5|10.5|1.3|katori:150,cup:200
chicken 65|chicken sixty five|250|20|10|14.5|0.5|pc:25,plate:150,katori:100
chilli chicken|chicken chilli,dragon chicken|210|16|10|12|1|katori:120,plate:200
chicken fry|kozhi varuval,chicken varuval,fried chicken,chicken roast,chicken sukka,kfc,kfc chicken,broasted chicken|240|22|5|14.5|0.5|pc:60,katori:100,plate:200
grilled chicken|tandoori chicken,chicken tandoori,grill chicken,al faham,alfaham,barbecue chicken,bbq chicken|170|25|2|7|0.3|pc:120,plate:250
chicken breast|boiled chicken,chicken breast boiled,grilled chicken breast,boiled chicken breast|165|31|0|3.6|0|g:1,pc:150
chicken leg|chicken drumstick,chicken thigh,leg piece|190|24|0|10|0|pc:100
chicken tikka|tikka|150|24|3|5|0.5|pc:30,plate:180
chicken lollipop|lollipop chicken|260|17|12|16|0.5|pc:40
chicken shawarma|shawarma,shawarma roll,chicken shawarma roll|220|13|20|10|1.5|pc:250,plate:300
chicken soup|chicken clear soup,nattu kozhi soup,chicken rasam|45|5|2|2|0.2|cup:240,katori:200
chicken stew|chicken ishtu|120|9|5|7|1|katori:150,cup:200
chicken nuggets|nuggets|300|15|17|19|1|pc:18
chicken sandwich|chicken club sandwich|240|12|26|9.5|2|pc:170
chicken burger||260|13|26|11.5|1.5|pc:200
chicken puff|chicken puffs|310|9|28|18|1|pc:100
chicken cutlet||240|13|15|14.5|1|pc:70
chicken roll|chicken kathi roll,chicken frankie|240|11|26|10.5|1.5|pc:200
chicken momos|chicken momo|175|9|20|6.5|1|pc:30,plate:180
mutton|cooked mutton,goat meat,lamb|230|25|0|14.5|0|g:1,katori:100,pc:40
mutton curry|mutton kuzhambu,mutton gravy,mutton masala,attu kari kuzhambu,mutton kulambu,lamb curry|185|14|4|12.5|1|katori:150,cup:200
mutton fry|mutton varuval,mutton chukka,mutton sukka,mutton pepper fry|250|20|4|17|0.8|katori:100,plate:150
keema|mutton keema,kheema,keema masala,kothu kari|200|15|5|13.5|1.2|katori:150,cup:200
mutton soup|attukal soup,paya,aatu kaal soup,bone soup|70|6|2|4|0.2|cup:240,katori:200
beef curry|beef roast,beef fry,erachi,beef ularthiyathu,beef|210|20|4|12.5|1|katori:150,cup:200
pork curry|pork|220|15|4|16|1|katori:150,cup:200
duck curry|tharavu curry,duck roast|200|14|4|14|1|katori:150,cup:200
fish|cooked fish,steamed fish,grilled fish|130|22|0|4.5|0|g:1,pc:100
fish curry|meen kuzhambu,fish kuzhambu,meen curry,fish gravy,meen kulambu,fish kulambu|120|11|4|6.5|0.8|katori:150,cup:200,pc:80
fish fry|meen varuval,fried fish,meen fry,fish tawa fry,meen porichathu,fish roast|220|20|6|13|0.5|pc:80,plate:150
fish moilee|meen molee,fish molee|130|11|4|8|0.5|katori:150,cup:200
fish fingers|fish finger|250|12|20|13.5|1|pc:25
prawns|shrimp,boiled prawns,prawn,shrimps|100|21|0.5|1.5|0|g:1,katori:100
prawn masala|prawn curry,eral thokku,eral masala,shrimp curry,prawns gravy,eral kuzhambu|140|14|5|7|0.8|katori:150,cup:200
prawn fry|eral varuval,fried prawns,prawns fry,prawn roast|210|19|6|12|0.5|katori:100,plate:150
crab curry|nandu kuzhambu,nandu masala,crab masala|110|12|4|5|0.8|katori:150,cup:200
squid fry|kanava fry,calamari|180|16|8|9.5|0.3|katori:100,plate:150
tuna|canned tuna,tuna fish|130|28|0|1.3|0|g:1,can:100
sardine|mathi,chaala,sardines,mathi meen|210|25|0|12|0|pc:40,g:1
mackerel|ayala,kanangeluthi,bangda,kanangkeluthi|205|19|0|14|0|pc:100,g:1
salmon||208|20|0|13|0|g:1,pc:120
seer fish|vanjaram,king fish,surmai,neymeen|140|22|0|5.5|0|pc:100,g:1
# ---------- dairy & protein ----------
milk|paal,toned milk,cow milk,doodh,full milk,whole milk,hot milk,warm milk|62|3.2|4.8|3.3|0|cup:240,glass:250,tumbler:150
skimmed milk|skim milk,double toned milk,low fat milk|35|3.4|5|0.2|0|cup:240,glass:250
buffalo milk|erumai paal|100|3.8|5|7|0|cup:240,glass:250
milk with sugar|sweet milk|85|3|10|3|0|cup:240,glass:250
turmeric milk|haldi milk,manjal paal,golden milk|80|3.2|9|3.4|0.2|cup:240,glass:250
curd|thayir,yogurt,dahi,yoghurt,mosaru,plain curd|60|3.1|4.6|3.3|0|katori:150,cup:240,tbsp:15
greek yogurt|hung curd,greek yoghurt|97|9|3.6|5|0|katori:150,cup:200,tbsp:15
raita|pachadi,vegetable raita,onion raita,cucumber raita,thayir pachadi,boondi raita|60|2.5|5|3.3|0.7|katori:150,cup:200,tbsp:20
buttermilk|mor,moru,chaas,neer mor,majjige,masala buttermilk,spiced buttermilk|20|1|2.5|0.6|0.1|glass:250,cup:240
lassi|sweet lassi,mango lassi|100|2.8|17|2.4|0|glass:250
paneer|cottage cheese,raw paneer|265|18|3.5|20|0|g:1,katori:100,cube:20
tofu|soya paneer|76|8|1.9|4.8|0.3|g:1,katori:100
cheese|cheese slice,processed cheese,cheese slices|310|19|5|24|0|slice:20,cube:20
mozzarella|mozzarella cheese|300|22|2.2|22|0|g:1,cup:110
soya chunks|soya,soybean chunks,soya chunks dry|345|52|33|0.5|13|g:1,cup:50,katori:30
whey protein|protein shake,whey,protein powder,whey isolate,protein scoop|380|78|8|4|1|scoop:32
protein bar|protein bars|380|25|40|12|8|pc:60
peanut butter|pb|590|25|20|50|6|tbsp:16,tsp:5
# ---------- legumes & sprouts ----------
sprouts|sprouted moong,moong sprouts,sprouted green gram,mulai payaru,sprouts salad|35|3|5.9|0.2|1.8|cup:100,katori:100
sundal|chana sundal,channa sundal,kondakadalai sundal,kadalai sundal,chickpea sundal|140|7|19|4|5.5|cup:150,katori:100
pattani sundal|peas sundal,green peas sundal,pachai pattani sundal|120|6|16|3.5|5|cup:150,katori:100
boiled chana|boiled chickpeas,chickpeas,kabuli chana,channa,kondakadalai,boiled channa|164|8.9|27|2.6|7.6|cup:160,katori:100
boiled green gram|green gram,moong,pachai payaru,whole moong,boiled moong|105|7|19|0.4|7.6|cup:200,katori:150
boiled peanuts|vegavaitha kadalai,boiled groundnuts,avicha kadalai|320|13.5|21|22|8.8|handful:40,cup:100
groundnuts|peanuts,kadalai,verkadalai,moongphali,roasted peanuts,groundnut,peanut,roasted groundnuts|567|25.8|16|49|8.5|handful:30,g:1,cup:145,tbsp:10
roasted chana|pottukadalai,roasted gram,fried gram,bhuna chana,pottu kadalai,roasted chickpeas|370|22|58|5|17|handful:30,tbsp:10,cup:100
makhana|fox nuts,lotus seeds,phool makhana,roasted makhana|350|9.7|77|0.1|14|cup:15,handful:15
# ---------- nuts & seeds ----------
almonds|badam,almond,soaked almonds|579|21|21.6|50|12.5|pc:1.2,handful:28
cashews|cashew,mundhiri,kaju,cashew nuts,mundhiri paruppu|553|18|30|44|3.3|pc:1.5,handful:28
walnuts|walnut,akhrot|654|15|14|65|6.7|pc:4,handful:28
pistachios|pista,pistachio|560|20|28|45|10|handful:28,pc:0.7
sunflower seeds|pumpkin seeds,mixed seeds,seeds|560|21|20|49|8|tbsp:10,handful:28
chia seeds|chia|486|17|42|31|34|tbsp:12,tsp:4
flax seeds|flaxseed,alsi,ali vithai,flaxseeds|534|18|29|42|27|tbsp:10,tsp:3
trail mix|dry fruits,mixed nuts,nuts,dry fruit mix|560|17|30|43|6|handful:30
dates|pericham pazham,date,khajoor,kharjura,dry dates|282|2.5|75|0.4|8|pc:8
raisins|kismis,dry grapes,ularntha thratchai,kishmish|299|3.1|79|0.5|3.7|tbsp:10,handful:30
fig|anjeer,dry fig,athi pazham,figs,dried fig|249|3.3|64|0.9|9.8|pc:8
coconut|thengai,fresh coconut,grated coconut,coconut pieces|354|3.3|15|33.5|9|tbsp:10,cup:80,pc:30
# ---------- fats, sugar, condiments ----------
ghee|nei,clarified butter,desi ghee|900|0|0|100|0|tsp:5,tbsp:14
butter|amul butter,white butter,vennai|717|0.9|0.1|81|0|tsp:5,tbsp:14
oil|cooking oil,coconut oil,gingelly oil,groundnut oil,sunflower oil,olive oil,nallennai,sesame oil,ennai|884|0|0|100|0|tsp:5,tbsp:14
sugar|white sugar,sakkarai,cheeni|400|0|100|0|0|tsp:4,tbsp:12
jaggery|vellam,gur,karupatti,palm jaggery,nattu sakkarai|380|0.4|95|0.1|0|tsp:5,tbsp:15,pc:10
honey|then|304|0.3|82|0|0.2|tsp:7,tbsp:21
jam|fruit jam,kissan jam|270|0.4|69|0.1|1|tbsp:20,tsp:7
mayonnaise|mayo|680|1|1.5|75|0|tbsp:15
ketchup|tomato ketchup,tomato sauce|110|1.2|26|0.2|0.3|tbsp:17
coconut chutney|chutney,thengai chutney,white chutney,nariyal chutney|180|2.5|7|16|4.5|tbsp:15,katori:60,ladle:30
tomato chutney|thakkali chutney,red chutney,tomato thokku|90|1.5|9|5.5|1.5|tbsp:15,katori:60
onion chutney|vengaya chutney,kara chutney,onion tomato chutney|100|1.5|9|6.5|1.5|tbsp:15,katori:60
mint chutney|pudina chutney,green chutney,coriander chutney,kothamalli chutney,coriander mint chutney|80|2.5|7|4.8|3|tbsp:15,katori:60
peanut chutney|kadalai chutney,groundnut chutney,verkadalai chutney|250|9|10|19.5|4|tbsp:15,katori:60
gunpowder|idli podi,milagai podi,podi,chutney powder|400|17|45|17|12|tsp:5,tbsp:12
pickle|oorugai,achar,mango pickle,lemon pickle,lime pickle,avakaya|190|1.5|9|16.5|3|tsp:5,tbsp:15
papad|appalam,pappadam,papadum,papad fried,papads,appalams|450|15|40|25|6|pc:12
salad|green salad,vegetable salad,cucumber salad,kosambari,veggie salad|25|1|4.5|0.3|1.8|cup:100,katori:100,plate:150
fruit salad|fruit bowl,cut fruits,mixed fruits|70|0.8|17|0.3|1.8|cup:150,katori:150
# ---------- drinks ----------
tea|chai,tea with milk,milk tea,masala chai,ginger tea,inji tea,tea with sugar,chaya,elaichi tea|50|1.6|7.5|1.6|0|cup:150,glass:150,tumbler:150
tea without sugar|tea no sugar,sugarless tea,tea without sugar milk|28|1.6|2.6|1.6|0|cup:150,tumbler:150
black tea|green tea,lemon tea,herbal tea,black tea no sugar,red tea,sulaimani|1|0|0.2|0|0|cup:150
filter coffee|coffee,kaapi,kapi,milk coffee,south indian coffee,coffee with milk,degree coffee|55|1.7|8|1.8|0|cup:150,tumbler:150
coffee without sugar|sugarless coffee,coffee no sugar|30|1.7|2.6|1.8|0|cup:150,tumbler:150
black coffee|americano,espresso,black coffee no sugar|2|0.1|0|0|0|cup:150
cappuccino|latte,cafe latte,cappucino,flat white|50|2.8|4.5|2.3|0|cup:240
cold coffee|iced coffee,frappe|90|3|13|3|0|glass:250
hot chocolate|cocoa|80|3.5|11|2.5|1|cup:240
boost|horlicks,bournvita,health drink,complan,maltova,viva|85|3.5|12|2.5|0.3|cup:200,glass:250
badam milk|badam paal,almond milk drink|110|3.5|15|4|0.3|glass:250,cup:200
rose milk|rosemilk|95|3|14|3|0|glass:250
milkshake|chocolate milkshake,mango shake,strawberry shake,milk shake,chocolate shake|110|3|17|3.5|0.5|glass:300
smoothie|banana smoothie,fruit smoothie|85|2.5|16|1.5|1.5|glass:300
fresh lime soda|lime juice,lemon juice,nimbu pani,lemonade,lime soda,sweet lime soda,lemon water with sugar|35|0.1|9|0|0|glass:250
lemon water|nimbu water,lemon water without sugar|3|0.1|0.8|0|0|glass:250
tender coconut|elaneer,coconut water,ilaneer,elaneer water,nariyal pani|19|0.7|3.7|0.2|1.1|glass:250,pc:300
orange juice|fruit juice,juice,mosambi juice,sweet lime juice,fresh juice,orange fresh juice|45|0.7|10.4|0.2|0.2|glass:250
apple juice|apple fresh juice|46|0.1|11.3|0.1|0.2|glass:250
watermelon juice|tharbooz juice|35|0.6|8|0.2|0.3|glass:250
mango juice|maaza,frooti,slice,mango drink|60|0.2|15|0|0|glass:250
pomegranate juice|mathulai juice,anar juice|54|0.2|13|0.3|0.1|glass:250
sugarcane juice|karumbu juice,ganne ka ras|70|0.2|17.5|0|0|glass:250
nannari sarbath|sarbath,nannari,sherbet|60|0|15|0|0|glass:250
jigarthanda|jigar thanda|160|3.5|25|5|0|glass:250
soft drink|coke,pepsi,cola,sprite,7up,thums up,fanta,mirinda,limca,mountain dew,coca cola,soda drink|42|0|10.6|0|0|glass:250,can:330,bottle:500
diet coke|coke zero,diet soda,pepsi black,diet pepsi|1|0|0|0|0|can:330,glass:250
club soda|plain soda,soda water,sparkling water|0|0|0|0|0|glass:250,bottle:500
energy drink|red bull,monster,sting|45|0|11|0|0|can:250
iced tea|ice tea,lipton ice tea|30|0|7.5|0|0|glass:250,bottle:500
beer|lager,strong beer|43|0.5|3.6|0|0|bottle:650,can:330,glass:330,pint:470
wine|red wine,white wine|85|0.1|2.6|0|0|glass:150
whisky|whiskey,rum,vodka,brandy,gin,liquor|250|0|0|0|0|peg:30
# ---------- fruits ----------
banana|bananas,vazhaipazham,vazhai pazham,kela,yellow banana,robusta banana,robusta,pazham|89|1.1|22.8|0.3|2.6|pc:120
small banana|poovan banana,elaichi banana,yelakki banana,rasthali,poovan pazham,small bananas|100|1.2|25|0.3|2|pc:60
nendran banana|nendran,kerala banana,ethapazham,nendran pazham|120|1.2|30|0.3|2.5|pc:180
red banana|sevvazhai,chevvazhai|90|1.2|23|0.3|2.6|pc:150
banana chips|kerala chips,nendran chips,vazhakkai chips|520|2.3|58|33|4|handful:30,cup:50,packet:100
apple|apples,red apple,green apple,seb|52|0.3|13.8|0.2|2.4|pc:180
orange|oranges,santra,kamala orange|47|0.9|11.8|0.1|2.4|pc:130
mosambi|sweet lime,musambi,sathukudi|43|0.8|9.3|0.3|0.5|pc:150
mango|mangoes,maampazham,mambazham,aam,mango slices|60|0.8|15|0.4|1.6|pc:200,cup:165,slice:50
papaya|pappaya,papali,papaya slices|43|0.5|10.8|0.3|1.7|cup:145,slice:100,katori:150
watermelon|tharbooz,tarbuj,water melon|30|0.6|7.6|0.2|0.4|cup:150,slice:280
muskmelon|kirni pazham,cantaloupe,musk melon|34|0.8|8.2|0.2|0.9|cup:160,slice:150
guava|koyya,koyya pazham,amrud,guavas|68|2.6|14.3|1|5.4|pc:100
grapes|thratchai,green grapes,black grapes,grape|69|0.7|18|0.2|0.9|cup:150,handful:50
pomegranate|mathulai,anar,pomegranate seeds|83|1.7|18.7|1.2|4|cup:170,pc:250
pineapple|annasi pazham,pineapple slices|50|0.5|13|0.1|1.4|cup:165,slice:85
chikoo|sapota,sapodilla,chiku|83|0.4|20|1.1|5.3|pc:100
jackfruit|pala pazham,chakka,jackfruit bulbs,palapazham|95|1.7|23|0.6|1.5|pc:30,cup:165
custard apple|seetha pazham,sitaphal|94|2.1|23.6|0.3|4.4|pc:150
pear|naspati,pears|57|0.4|15|0.1|3.1|pc:180
kiwi|kiwis,kiwi fruit|61|1.1|14.7|0.5|3|pc:75
strawberry|strawberries|32|0.7|7.7|0.3|2|cup:150,pc:12
dragon fruit||60|1.2|13|0|3|pc:300,cup:200
amla|nellikai,gooseberry,indian gooseberry|44|0.9|10|0.6|4.3|pc:30
lychee|litchi|66|0.8|16.5|0.4|1.3|pc:10
plum|plums|46|0.7|11.4|0.3|1.4|pc:65
cherry|cherries|63|1.1|16|0.2|2.1|cup:140
avocado|butter fruit|160|2|8.5|14.7|6.7|pc:150
jamun|naval pazham,java plum|62|0.7|14|0.2|0.6|cup:100,pc:5
# ---------- vegetables ----------
cucumber|vellarikai,kheera,cucumbers|15|0.7|3.6|0.1|0.5|pc:200,cup:120
carrot|carrots,raw carrot|41|0.9|9.6|0.2|2.8|pc:60,cup:120
beetroot|beet|43|1.6|9.6|0.2|2.8|pc:80,cup:130
tomato|thakkali,tomatoes|18|0.9|3.9|0.2|1.2|pc:100
onion|vengayam,pyaz,onions|40|1.1|9.3|0.1|1.7|pc:100
sweet potato|sakkaravalli kizhangu,shakarkandi,sweet potatoes,boiled sweet potato|86|1.6|20|0.1|3|pc:130,cup:200
boiled potato|potato,aloo,urulaikizhangu,boiled aloo,potatoes|87|1.9|20|0.1|1.8|pc:150,cup:150
corn|sweet corn,boiled corn,bhutta,makkacholam,corn cob,american corn,masala corn|96|3.4|21|1.5|2.4|pc:100,cup:150
boiled vegetables|steamed vegetables,mixed vegetables boiled,boiled veggies|40|2|7|0.3|3|cup:150,katori:150
tapioca|kappa,maravalli kizhangu,cassava,boiled tapioca|160|1.4|38|0.3|1.8|cup:200,katori:150
tapioca chips|kappa chips,maravalli chips,maravalli kizhangu chips|500|1.5|60|28|3|handful:30,cup:50,packet:100
# ---------- snacks & bakery ----------
murukku|chakli,thenkuzhal,mullu murukku,kai murukku|520|8|58|28|3|pc:20,handful:30
mixture|namkeen,kara mixture,madras mixture,bombay mixture,south indian mixture|540|11|45|35|5|handful:30,cup:50,katori:50
kara boondi|khara boondi|530|10|48|33|4|handful:30,cup:50
ribbon pakoda|ola pakoda,ribbon murukku,ribbon pakkoda|520|9|55|29|3|handful:30,pc:15
seedai|uppu seedai,vella seedai|500|7|55|28|2|handful:30,pc:4
thattai|nippattu,thattuvadai,thattu vadai|500|9|55|27|4|pc:15
potato chips|lays,chips,wafers,potato wafers,bingo,uncle chips|540|6.5|52|34|4.5|packet:52,handful:30,cup:30
kurkure|cheetos,corn puffs|540|6|55|33|2|packet:90,handful:30
biscuit|biscuits,marie biscuit,marie,cookie,cookies,good day,parle g,parle-g,tiger biscuit,glucose biscuit,butter biscuit|470|7|72|17|2|pc:8
cream biscuit|bourbon,oreo,cream biscuits,dark fantasy,hide and seek|480|5|70|20|2|pc:12
digestive biscuit|digestive,digestives,oat biscuit|480|7|64|21|4|pc:15
rusk|toast rusk,rusks|410|11|72|8.5|3|pc:12
cake|cake slice,sponge cake,plum cake,birthday cake,tea cake|380|5|52|17|1|slice:60,pc:60
pastry|black forest,cream cake,pastries|340|4|42|17.5|1|pc:90
brownie|brownies|430|5|55|21|2.5|pc:60
muffin|cupcake,muffins,cupcakes|400|5.5|53|19|1.5|pc:70
donut|doughnut,donuts|420|5|50|22|1.5|pc:60
bun|sweet bun,plain bun,pav|290|8.5|52|5|2|pc:40
puffs|veg puff,puff,veg puffs,egg puff,mushroom puff,paneer puff|300|6|30|17.5|1.5|pc:90
sandwich|veg sandwich,grilled sandwich,bread sandwich,veg grilled sandwich|230|7|30|9|2.5|pc:150
burger|veg burger,aloo tikki burger|250|7|32|10.5|2.5|pc:180
pizza|pizza slice,veg pizza,cheese pizza,margherita,margherita pizza|260|11|32|9.5|2|slice:100
chicken pizza|non veg pizza,pepperoni pizza|270|12.5|30|11|2|slice:110
french fries|fries,finger chips|310|3.4|41|15|3.8|cup:70,packet:115
popcorn|plain popcorn|380|12|74|4.5|15|cup:8,packet:30
butter popcorn|movie popcorn,caramel popcorn|500|9|57|28|10|cup:11,packet:60
pani puri|golgappa,puchka,panipuri|180|3.5|28|6|2.5|pc:20,plate:120
bhel puri|bhel,bhelpuri|210|5|33|6.5|3|plate:150,cup:100
masala puri|masal puri|180|5|23|7.5|4|plate:200
pav bhaji|pavbhaji|170|4|23|7|3|plate:300
vada pav|vadapav|290|6|40|12|3|pc:140
dhokla|khaman dhokla|160|6|25|4|2|pc:30
veg momos|momos,steamed momos,veg momo,momo|160|5|25|4.5|2|pc:30,plate:180
spring roll|veg spring roll,spring rolls|250|5|30|12|2|pc:60
cutlet|veg cutlet,vegetable cutlet|220|4.5|25|11.5|3|pc:60
veg roll|kathi roll,egg roll,frankie,paneer roll|240|8|30|10|2|pc:200
# ---------- sweets ----------
mysore pak|mysorepak,mysore paak|560|5|50|38|1|pc:30
laddu|ladoo,laddoo,boondi laddu,motichoor laddu,ladu|430|6|58|19.5|1.5|pc:40
rava laddu|rava ladoo,rava ladu|420|6|58|18.5|1|pc:35
besan laddu|besan ladoo|500|10|52|28|3|pc:35
coconut laddu|thengai laddu,coconut ladoo|420|4|52|22|5|pc:30
jalebi|jangiri,jilebi,imarti,jilabi|380|3|60|14.5|0.5|pc:30
gulab jamun|gulab jamoon,jamun sweet,gulab jamuns|320|5|50|11|0.5|pc:40
rasgulla|rasagulla,rosogolla|186|4|40|1.5|0|pc:50
rasmalai|ras malai|220|6|25|10.5|0|pc:60
payasam|kheer,semiya payasam,paal payasam,rice kheer,vermicelli kheer,payasa|150|3.5|23|5|0.5|cup:150,katori:150
paruppu payasam|dal payasam,ada pradhaman,pradhaman,parippu payasam|200|3.5|30|7.5|2|cup:150,katori:150
kesari|rava kesari,kesari bath,sheera,suji halwa|330|3.5|45|15.5|0.8|cup:100,katori:100,plate:150
halwa|gajar halwa,carrot halwa,halva|300|4|38|15|2|cup:100,katori:100
tirunelveli halwa|wheat halwa,karachi halwa,iruttukadai halwa|420|2|55|22|0.5|pc:50
adhirasam|athirasam,adirasam|400|3.5|60|16.5|1|pc:40
kaju katli|kaju barfi,kaju katri|480|9|55|25|1.5|pc:15
barfi|burfi,milk barfi,coconut burfi,coconut barfi|400|8|52|18|1|pc:30
peda|doodh peda,milk peda|380|8|55|14|0|pc:25
soan papdi|son papdi,soan papri|500|6|60|26|1|pc:30
ice cream|icecream,vanilla ice cream,chocolate ice cream,ice creams|207|3.5|24|11|0.7|cup:70,scoop:65,katori:100
kulfi|kulfi ice cream|230|5|25|12.5|0|pc:70
dark chocolate||550|6|46|38|10|g:1,pc:10
chocolate|milk chocolate,dairy milk,kitkat,5 star,snickers,chocolate bar,munch,perk|535|7.6|59|30|3.4|g:1,pc:40,bar:40
candy|toffee,eclairs,lollipop,candies|400|0|95|3|0|pc:5
custard|fruit custard|120|3|18|4|0.5|cup:150,katori:150
# ---------- more south indian ----------
kal dosa|kal dosai,thick dosa|165|4|28|4|1.5|pc:70
wheat dosa|godhumai dosai,atta dosa|175|5|27|5.5|3.5|pc:80
oats dosa|oats dosai|160|5|24|5|3|pc:80
rava uthappam|rava uttapam|175|4.5|26|6|1.5|pc:140
mysore masala dosa|mysore dosa|200|4|28|8|2|pc:200
paneer dosa|paneer masala dosa|210|8|24|9.5|1.5|pc:180
chicken dosa|chicken kari dosai,kari dosai|200|10|20|9|1|pc:180
kothu parotta|kothu porotta,egg kothu parotta,chicken kothu parotta,veg kothu parotta|200|8|22|9|1.5|plate:300,cup:200
chilli parotta|chilli porotta|230|5.5|28|11|1.5|plate:250
egg parotta|muttai parotta|300|9|38|12.5|1.5|pc:120
ceylon parotta|egg ceylon parotta|300|9|36|13.5|1.5|pc:150
idli upma|idli fry|150|3.5|24|4.5|1.2|cup:150,plate:200
dosa podi idli|podi idli,ghee podi idli|190|5|28|6.5|2|pc:45
ven pongal vada|pongal vada combo|200|5.5|24|9|2|plate:250
kuzhi paniyaram chutney|paniyaram set|180|4|26|6.5|1.5|plate:150
thayir semiya|curd semiya,curd vermicelli|110|3|17|3.3|0.5|cup:200,katori:150
aval payasam|poha kheer|160|3.5|25|5|0.6|cup:150
puttu kadala|puttu with kadala curry|150|5|26|3|3|plate:300
appam stew|appam with stew|120|2.5|20|3.5|1.5|plate:280
kappa meen curry|kappa and fish curry|140|7|20|3.5|1.5|plate:350
parippu vada|parippu vadai|310|11|28|17|5|pc:40
unniyappam|unni appam|330|3.5|50|13|2|pc:25
pazham pori|ethakka appam,banana fritter|260|3|38|11|2|pc:70
achappam|rose cookie|510|5|55|30|1|pc:12
kozhukatta|kerala kozhukatta|200|3|36|5|2|pc:40
ela ada|elayappam,ada|220|3|38|6.5|2|pc:60
kerala sadya|sadya,onam sadya|130|3|20|4.3|2.8|plate:800
gongura chutney|gongura pachadi,pulicha keerai thokku|150|2|8|12.5|4|tbsp:15,katori:60
pappu|andhra dal,tomato pappu,mudda pappu|100|6|13|2.8|3|katori:150,cup:200
pulusu|andhra pulusu,chepala pulusu|90|5|6|5|1.5|katori:150,cup:200
dibba rotti|minapa rotti|200|7|30|6|3|pc:100
ragi sankati|ragi sangati|115|2.5|24|0.8|2.6|ball:200
mangalore buns|banana buns|330|5|45|14.5|2|pc:60
goli bajji|goli baje mangalore|300|5|38|14.5|1.5|pc:30
chettinad kuzhambu|kara kulambu chettinad|120|2.5|9|8.5|2.5|katori:100
kola urundai|mutton kola urundai|300|17|10|21.5|2|pc:25
nattu kozhi curry|country chicken curry,nattu kozhi kuzhambu|140|14|4|7.5|1|katori:150,cup:200
pepper rasam|milagu thanni,mulligatawny|35|1.2|5|1.2|0.8|cup:200,katori:150
kollu rasam|horse gram rasam|45|2.5|6|1.2|1.5|cup:200,katori:150
kollu|horse gram,horsegram sundal,kollu sundal|150|9|22|2.5|6|cup:150,katori:100
mochai kuzhambu|field beans curry,avarai kuzhambu|115|5|12|5|4|katori:150
karamani|karamani sundal,black eyed peas,lobia|120|7.5|19|1.5|5.5|cup:150,katori:100
sundakkai vathal kuzhambu|sundakai kuzhambu|105|1.8|10|6.5|2.5|katori:100
murungai keerai|drumstick leaves poriyal,moringa leaves|80|5|7|3.5|3|katori:100
vazhaipoo vadai|banana flower vada|260|8|26|13.5|5|pc:40
vazhakkai fry|raw banana fry,plantain fry,vazhakkai poriyal|170|1.5|25|7.5|2.5|katori:100
chow chow poriyal|chayote poriyal|60|1|6|3.5|1.8|katori:100
beans paruppu usili|beans usili curry|170|7|12|10.5|4|katori:100
cabbage kootu|cabbage dal kootu|80|3.5|9|3.5|2.5|katori:150
pavakkai fry|bitter gourd fry,karela fry|130|2|11|8.5|3|katori:100
keerai poriyal|spinach poriyal,thandu keerai poriyal|70|3|5|4.5|2.5|katori:100
# ---------- more north indian & indo chinese ----------
chole kulche|chole kulcha|210|6.5|30|7|4.5|plate:300
dal baati|dal bati churma|290|8|40|11|5|plate:350
aloo tikki|aloo tikki chaat|210|3.5|28|9.5|3|pc:60
papdi chaat|chaat,dahi papdi chaat|200|5|26|8.5|2.5|plate:150
samosa chaat||200|5|25|9|3.5|plate:250
dahi puri|dahi poori|190|4.5|25|8|2.5|plate:150
sev puri|sevpuri|250|5|30|12|3|plate:150
misal pav|misal|160|6|20|6.5|4|plate:350
upma pesarattu|mla pesarattu|150|5.5|23|4.5|2.5|pc:150
paneer 65||290|13|14|20.5|1|katori:100,plate:150
mushroom 65||190|4|18|11.5|2|katori:100
baby corn manchurian|baby corn fry|180|3.5|20|9.5|2.5|katori:120,plate:200
paneer fried rice||190|6|24|8|1.2|cup:180,plate:300
mixed fried rice|mixed fried rice non veg|185|8|22|7|1|cup:180,plate:300
veg soup noodles|thukpa|60|2.5|9|1.5|1|cup:300
sweet corn soup|corn soup|60|1.5|10|1.5|1|cup:240
hot and sour soup|manchow soup|55|2|7|2|1|cup:240
chicken manchow soup|chicken soup chinese|60|4|6|2.2|0.8|cup:240
tomato soup|cream of tomato|55|1.5|8|2|1|cup:240
# ---------- more meat & fish ----------
chicken liver fry|liver fry,eeral fry|190|20|5|10|0|katori:100
mutton liver|attu eeral|180|20|4|9.5|0|katori:100
chicken pepper fry|pepper chicken fry,milagu kozhi varuval|230|22|5|13.5|1|katori:100,plate:150
chicken ghee roast|mangalore chicken ghee roast|260|20|5|18|0.8|katori:100
chicken seekh kebab|seekh kebab,kebab,kabab|220|17|5|15|0.5|pc:40
mutton seekh kebab|mutton kebab|250|17|5|18|0.5|pc:40
egg white omelette|egg white omlet|90|11|2|4|0|pc:100
boiled egg whites|egg whites only|52|11|0.7|0.2|0|pc:33
tandoori fish|fish tikka|160|22|4|6|0.3|pc:100
fish cutlet|meen cutlet|220|12|18|11|1|pc:60
prawn biryani masala|prawn thokku|160|14|6|9|1|katori:100
anchovy fry|nethili fry,nethili varuval|240|20|8|14.5|0.3|katori:100
pomfret fry|vavval meen fry,pomfret|210|19|5|12.5|0.3|pc:120
mathi fry|sardine fry,chaala fry|240|21|5|15|0|pc:40
crab fry|nandu fry|170|17|6|8.5|0.3|katori:100
chicken keema|kothu kozhi|170|17|4|9.5|1|katori:150
# ---------- dairy & drinks more ----------
condensed milk|milkmaid|320|8|54|8.5|0|tbsp:20
milk powder|dairy whitener,everyday milk powder|500|25|38|27|0|tsp:3,tbsp:8
almond milk|unsweetened almond milk|15|0.5|0.6|1.2|0.3|glass:250,cup:240
soy milk|soya milk|45|3.3|3|2|0.5|glass:250,cup:240
oat milk||50|1|7|1.5|0.8|glass:250,cup:240
paneer tikka roll|paneer kathi roll|250|10|26|12|2|pc:200
curd with sugar|sweet curd,mishti doi|100|3|14|3.5|0|katori:150
buttermilk sweet|sweet buttermilk|45|1.2|7|1.3|0|glass:250
masala milk|kesar milk,saffron milk|100|3.5|13|3.8|0.2|glass:250
kokum juice|sol kadhi|45|0.5|10|0.5|0.3|glass:250
aam panna|raw mango drink|60|0.2|15|0|0.3|glass:250
coconut milk|thengai paal|200|2|3|21|0.5|cup:240,tbsp:15
electrolyte drink|glucon d,ors,electral|25|0|6|0|0|glass:250
protein shake with milk|whey with milk|95|10|7|3|0|glass:300
# ---------- breakfast & packaged ----------
peanut butter toast|pb toast|370|13|38|19|4.5|slice:45
avocado toast||230|6|23|13|6|slice:90
egg sandwich|egg mayo sandwich|230|10|24|10.5|1.5|pc:150
paneer sandwich||250|11|26|11.5|2|pc:160
corn flakes with milk|cornflakes with milk,cereal with milk,chocos with milk|95|3.5|16|2.2|0.5|cup:240,katori:240
chocos|kelloggs chocos,coco pops|380|7|80|3|5|cup:30
granola bar|cereal bar,oats bar|420|8|65|14|5|pc:30
instant oats|oats packet,saffola masala oats|380|11|67|7.5|9|packet:40
bournvita powder|horlicks powder,boost powder|380|7|85|2|1|tsp:7,tbsp:20
khakhra||410|12|65|11|8|pc:20
nachos|tortilla chips|500|7|63|25|4|handful:30,packet:60
popcorn masala|masala popcorn|430|10|60|17|11|cup:10,packet:40
roasted makhana masala|masala makhana|420|9|65|13.5|12|cup:20,packet:60
peanut chikki|kadalai mittai,chikki,groundnut candy|500|14|58|24|4|pc:20
ellu urundai|sesame balls,til laddu|520|12|50|30|7|pc:20
dates laddu|khajur laddu|360|5|60|11|6|pc:25
protein cookie|protein biscuit|430|20|50|16|6|pc:30
# ---------- more fruits & veg ----------
banana shake|banana milkshake|100|3|16|2.8|0.8|glass:300
tender coconut pulp|elaneer vazhukkai,coconut malai|90|1.5|7|7|2.5|cup:80
sapota shake|chikoo shake|120|3|20|3.3|2|glass:300
mango slice|ripe mango slice|60|0.8|15|0.4|1.6|slice:50
banana raw|raw banana,vazhakkai|90|1.3|23|0.4|2.6|pc:150
peas|green peas,pattani,boiled peas|81|5.4|14.5|0.4|5.1|cup:150,katori:100
broccoli|boiled broccoli|35|2.4|7|0.4|3.3|cup:150
spinach|boiled spinach,palak keerai|23|3|3.8|0.3|2.4|cup:180
mushroom|button mushroom,boiled mushrooms|28|3|5|0.3|2|cup:150
capsicum|bell pepper,kudamilagai|20|0.9|4.6|0.2|1.7|pc:120
lettuce|salad leaves|15|1.4|2.9|0.2|1.3|cup:50
cabbage|muttaikose|25|1.3|5.8|0.1|2.5|cup:90
cauliflower|gobi|25|1.9|5|0.3|2|cup:100
pumpkin|parangikai,poosanikai,kaddu|26|1|6.5|0.1|0.5|cup:120
bottle gourd|suraikai,lauki|15|0.6|3.4|0|0.5|cup:120
drumstick|murungakkai|37|2.1|8.5|0.2|3.2|pc:60
# ---------- more sweets ----------
paal kova|palkova,khoa,mawa|420|14|45|20|0|pc:30,tbsp:20
sakkarai pongal ghee|chakkarai pongal ghee|260|3.5|38|10.5|1|cup:150
kozhukattai coconut|poorna kozhukattai|230|3|40|6.5|2.5|pc:40
badam halwa||520|10|45|33|4|tbsp:30,katori:80
gulab jamun with ice cream|jamun ice cream|260|4|38|10.5|0.5|plate:150
falooda||150|3.5|25|4|0.5|glass:300
basundi|rabri,rabdi|250|7|30|11.5|0|katori:100
shrikhand||300|6|45|11|0|katori:100
semiya kesari||300|3.5|48|11|1|cup:120
boondi|sweet boondi|470|6|60|23|1.5|cup:60
mysore pak soft|ghee mysore pak|580|5|45|42|1|pc:30
idli sambar|idli with sambar,idli set|100|3.5|18|1.5|2|plate:250
oats idli|oats idly|120|4.5|21|2|2.5|pc:45
moong dal chilla|besan chilla,chilla,cheela,besan cheela|180|9|22|6|4|pc:80
besan|gram flour,kadalai maavu|387|22|58|6.7|11|g:1,tbsp:10,cup:90
sattu|sattu drink,sattu sharbat|60|3.5|10|0.8|2.5|glass:250
poha chivda|chivda,aval mixture|480|8|60|23|4|handful:30,cup:50
sabudana khichdi|javvarisi upma,sago khichdi,javvarisi kichadi|190|1.5|32|6.5|1|cup:150,katori:150
javvarisi payasam|sago payasam,sabudana kheer|140|2.5|24|4|0.3|cup:150
fruit yogurt|flavoured yogurt,flavored yogurt|95|3.5|15|2.5|0|cup:100
cheese sandwich|cheese toast|270|11|28|12.5|2|pc:150
chicken wrap|wrap|230|12|25|9|2|pc:220
veg wrap|paneer wrap|220|6|30|8.5|3|pc:200
garlic bread|cheese garlic bread|350|8|42|16.5|2|slice:35
hummus|hummus dip|166|7.9|14|9.6|6|tbsp:15
falafel|falafels|330|13|31|17.8|5|pc:17
chocolate milk|cold chocolate milk|80|3.2|12|2.2|0.6|glass:250
salt lassi|namkeen lassi,salted lassi|50|3|4.5|2.3|0|glass:250
banana bread|banana cake|330|4|55|10.5|1.7|slice:60
date shake|dates milkshake,khajur shake|130|3.5|22|3.3|1.5|glass:300
mutton biryani boneless|boneless biryani|190|9.5|19|8.5|1|plate:400
`;

export type FoodRow = {
  name: string;
  aliases: string[];
  kcal: number; p: number; c: number; f: number; fib: number; // per 100 g
  portions: [string, number][]; // first is default unit
};

export function parseFoodTable(src = FOOD_TABLE): FoodRow[] {
  const rows: FoodRow[] = [];
  for (const raw of src.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const [name, al, kcal, p, c, f, fib, por] = line.split("|");
    rows.push({
      name: name.trim(),
      aliases: al ? al.split(",").map((s) => s.trim()).filter(Boolean) : [],
      kcal: +kcal, p: +p, c: +c, f: +f, fib: +fib,
      portions: (por || "g:1").split(",").map((x) => { const [u, g] = x.split(":"); return [u.trim(), +g] as [string, number]; }),
    });
  }
  return rows;
}
