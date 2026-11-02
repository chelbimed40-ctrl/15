import json

img2 = """1 Get to = يصل
2 Go away = يبتعد
3 Fly out = يقلع
4 Take over = يسيطر
5 Get up = ينهض
6 Catch up = اللحاق بالركب
7 Go abroad = يسافر خارجا
8 Stay at = يقيم
9 have you thought about = هل فكرت في
10 Get home = وصل الى المنزل
11 Every so often = بين الحين والآخر
12 Hang out = يقضي بعد الوقت
13 Turn up = يصل
14 Look up = ينظر الى الأعلى/يبحث
15 Work out = يمرن/يحسب
16 Get out = يحضر/يخرج/يغادر
17 Heat up = يسخن
18 Cool down = يبرد
19 Clean up = نظف
20 Wash up = يغسل الأطباق
21 Chop up = يقطع
22 Put away = وضع جانبا
23 Go up = ذهب
24 Eat up = اكل
25 Get away = ذهب في اجازة
26 Proud = فخور
27 awesome = مذهل
28 Get over = يتعافى من
29 Cut back on = يخفض من
30 Give up = يتخلى عن
31 instead of = بدلا من
32 Each other = بعضهم البعض
33 every so often = من حين الى اخر
34 Move in = ينتقل للعيش
35 To sum up = باختصار
36 So far = حتى الان
37 To dust = ينظف الغبار
38 to get bored = يشعر بالملل
39 To Steer clear of = اتحاشى
40 To cut back = قلص من
41 At all = على الاطلاق
42 All that said = كل ما قيل
43 All in all = في المجمل
44 be impressed by = انبهر ب
45 be expected to = من المتوقع
46 To work out = يتدرب
47 Take place = تقام
48 To make sure = احرص على
49 To send out = ارسل
50 Belonged to = تخص
51 to be in favour of = مؤيد ل
52 even though = بالرغم أن
53 A must-have = شرط أساسي
54 A nice-to-have = امر مفضل ان تمتلكه
55 Most off = معظم
56 All of this = كل هذا
57 Used to be = كان في السابق
58 To make improvements = يدخل تحسينات
59 Feels like = يبدو الأمر وكأنه
60 At all = على الاطلاق"""

img3 = """1 Deal = اتفقنا
2 Don't push it = لا تبالغ في الامر
3 To trick = خدع
4 Trust me = ثق بي
5 To put on = ارتدى
6 You are lucky = انت محظوظ
7 To be keen on = مولع ب
8 I'll do my best = سأبذل قصارى جهدي
9 By the way = بالمناسبة
10 That blew up in my face = انقلب الأمر ضدي
11 It went sideways = حدث خطأ غير متوقع
12 I pulled it off = لقد نجحت في ذلك
13 Hi there, just checking in = مرحباً، أردت فقط الاطمئنان عليكم
14 Ping me-hit me up-reach out = تواصل معي
15 To overcome = يتغلب
16 Managed to = تمكن من
17 reward = مكافئة
18 To reach Target = يصل الى الهدف
19 So that = كي
20 It's all the same = الامر سيان
21 At all = على الاطلاق
22 I don't mind = لا امانع
23 To be set in = تدور الاحداث في
24 To tell the story of = يروي قصة
25 To be keen on = يكون شغوف بـ
26 Can't bear = لا يطيق
27 To greet = يحي
28 To argue about = يجادل حول
29 The smell = الرائحة
30 To be on the same page = يتفق على وجهة نظر
31 To get along with = ينسجم مع
32 But then = لكن بعد ذلك
33 The empathy = التعاطف
34 To appreciate = يقدر
35 The sights = المعالم السياحية
36 along = على إمتداد
37 slightly = قليلا
38 the skyscrapers = ناطحات السحاب
39 There will be = سيكون هناك
40 on average = في المتوسط
41 i would have = لا كنت
42 To melt = يذوب/اذاب
43 Quite the opposite = بالعكس
44 The confort = الراحة
45 I've always been curious = لا طالما انتبهاني الفضول
46 To find out = يكتشف
47 do you happen to know = هل تعرف
48 The martial arts = الفنون القتالية
49 Relevant = مناسب ذو صلة
50 To accuse = اتهم
51 The careless = الاهمال
52 Mostly = في الغالب
53 Mainly about = بشكل رئيسي حول
54 my pleasure = من دواعي سروري
55 issue = مشكلة
56 The Honeymoon = شهر العسل
57 energy bills = فواتير الطاقة
58 The tip = النصيحة
59 you are trying your best = انت تبذل قصارى جهدك
60 survey = استطلاع الرأي
61 Bored = يشعر بالملل
62 The tabloids = الصحف الشعبية
63 To catch my attention = يلفت إنتباهي
64 here we go = ها نحن
65 stuck = عالق
66 the scandal = الفضيحة
67 To take his time = يتمهل
68 A waste if time = مضيعة للوقت
69 To share your thoughts = تبدي رأيك
70 feel free to = لا تتردد في"""

img1 = """1 Could you say that again? = هل يمكنك قول ذلك مرة أخرى؟
2 What do you mean? = ماذا تقصد؟
3 That sounds great. = يبدو ذلك رائعا.
4 I'm not sure. = لست متأكدا.
5 Can you help me? = هل يمكنك مساعدتي؟
6 Excuse me. = عذرا.
7 Pardon? = ماذا؟
8 I agree with you. = أتفق معك.
9 I'm afraid I disagree. = أخشى أنني لا أوافق.
10 Could you please...? = هل يمكنك من فضلك...؟
11 Thank you so much. = شكرا جزيلا لك.
12 You're welcome. = على الرحب والسعة.
13 It's okay. = لا بأس.
14 Take care. = اعتن بنفسك.
15 Have a nice day. = أتمنى لك يوما سعيدا.
16 How are you? = كيف حالك؟
17 I'm fine, thanks. = أنا بخير، شكرا.
18 What's your name? = ما اسمك؟
19 Nice to meet you. = من دواعي سروري مقابلتك.
20 How old are you? = كم عمرك؟
21 Where are you from? = من أين أنت؟
22 What time is it? = كم الساعة؟
23 I don't understand. = لا أفهم.
24 Can you repeat that? = هل يمكنك تكرار ذلك؟
25 I'll be right back. = سأعود حالا.
26 Can I have a coffee, please? = هل يمكنني الحصول على قهوة، من فضلك؟
27 I'd like to order, please. = أود أن أطلب، من فضلك.
28 How much is it? = كم السعر؟
29 Do you have this in another size? = هل لديك هذا بمقاس آخر؟
30 Can I try it on? = هل يمكنني تجربته؟
31 Where is the nearest bus stop? = أين أقرب محطة حافلات؟
32 How do I get to...? = كيف أصل إلى...؟
33 Is it far from here? = هل هو بعيد من هنا؟
34 What's the best way to get there? = ما أفضل طريقة للوصول؟
35 How much does it cost? = كم التكلفة؟
36 Do you have a map? = هل لديك خريطة؟
37 Can you show me on the map? = هل يمكنك أن تظهر لي على الخريطة؟
38 I'm lost. = أنا تائه.
39 Could you give me directions? = هل يمكنك إعطائي اتجاهات؟
40 I have a reservation. = لدي حجز.
41 Can I have the bill, please? = هل يمكنني الحصول على الفاتورة، من فضلك؟
42 It's too expensive. = إنه غالي جدا.
43 That's a good deal. = هذه صفقة جيدة.
44 I'm just looking. = أنا فقط أبحث.
45 I don't like it. = لا يعجبني.
46 Could you lower the price? = هل يمكنك تخفيض السعر؟
47 I'm in a hurry. = أنا على عجلة من أمري.
48 Can you recommend something? = هل يمكنك أن توصي بشيء؟
49 How do I pay? = كيف أدفع؟
50 Do you offer a refund? = هل تقدمون استرداداً؟
51 What's your opinion? = ما رأيك؟
52 In my opinion... = في رأيي...
53 I think so. = أعتقد ذلك.
54 I'm not so sure about that. = لست متأكداً جداً من ذلك.
55 That's interesting. = هذا مثير للاهتمام.
56 I completely agree. = أتفق تماما.
57 I partly agree. = أوافق جزئياً.
58 I'm curious about... = أنا فضولي بشأن...
59 Could you explain that? = هل يمكنك شرح ذلك؟
60 That makes sense. = هذا منطقي.
61 I see what you mean. = أفهم ما تقصده.
62 I have a question. = لدي سؤال.
63 Let's make a plan. = دعنا نضع خطة.
64 Shall we...? = ماذا عن...؟
65 I'm looking forward to it. = أنا أتطلع إليه.
66 I'm available. = أنا متاح.
67 Let's meet tomorrow. = لنلتقِ غدا.
68 Are you free this weekend? = هل أنت متفرغ هذا الأسبوع؟
69 We should go. = يجب أن نذهب.
70 That would be great. = سيكون ذلك رائعاً.
71 What's the catch? = ما الفخ؟
72 It's worth it. = إنه يستحق ذلك.
73 I don't mind. = لا أمانع.
74 I'd rather... = أفضل أن...
75 I'm sorry to hear that. = أشعر بالأسف لسماع ذلك.
76 I'm feeling tired. = أشعر بالتعب.
77 I'm a bit stressed. = أنا متوتر بعض الشيء.
78 I'm happy. = أنا سعيد.
79 I'm worried. = أنا قلق.
80 That's not a problem. = هذا ليس مشكلة.
81 No worries. = لا تقلق.
82 Look on the bright side. = انظر إلى الجانب المشرق.
83 I don't know. = لا أعلم.
84 Maybe. = ربما.
85 I'll think about it. = سأفكر في ذلك.
86 I'm not interested. = لست مهتماً.
87 It's up to you. = الأمر متروك لك.
88 I can't make it. = لا أستطيع الحضور.
89 Let's catch up soon. = لنلتق قريباً.
90 Have a good trip. = رحلة سعيدة.
91 Take it easy. = خذ الأمور ببساطة.
92 I'm proud of you. = أنا فخور بك.
93 You can do it. = يمكنك فعلها.
94 Keep in touch. = ابق على تواصل.
95 Good luck. = حظا موفقاً.
96 It was nice talking to you. = كان من الرائع التحدث معك.
97 See you later. = أراك لاحقاً.
98 Don't forget. = لا تنس.
99 You're very kind. = أنت لطيف جداً.
100 Take care of yourself. = اعتن بنفسك."""

import re

def process_img(text):
    words = []
    for line in text.split('\n'):
        if not line.strip(): continue
        # Remove leading number
        line = re.sub(r'^\d+\s+', '', line)
        parts = line.split(' = ')
        if len(parts) == 2:
            words.append({"en": parts[0].strip(), "ar": parts[1].strip()})
    return words

deck1 = process_img(img2)
deck2 = process_img(img3)
phrases = process_img(img1)

out = "export const decks: any[] = [\n"
out += '  { id: "img2", name: "أفعال مركبة وتعابير", latin: "PHRASAL VERBS", words: [\n'
for w in deck1:
    out += f'    {{ en: {json.dumps(w["en"])}, ar: {json.dumps(w["ar"])} }},\n'
out += '  ]},\n'
out += '  { id: "img3", name: "مفردات وعبارات مفيدة", latin: "USEFUL PHRASES", words: [\n'
for w in deck2:
    out += f'    {{ en: {json.dumps(w["en"])}, ar: {json.dumps(w["ar"])} }},\n'
out += '  ]},\n'
out += "];\n\n"

out += "export const phrases: any[] = [\n"
for p in phrases:
    out += f'  {{ en: {json.dumps(p["en"])}, ar: {json.dumps(p["ar"])} }},\n'
out += "];\n"

with open("out.ts", "w") as f:
    f.write(out)

