--
-- PostgreSQL database dump
--

\restrict kY8j4qORUJ88dTRvPfbWB9ryQTEB7J9UqQfcGJrtQewj9gh7ip1kwhCSwAUYVu6

-- Dumped from database version 15.17
-- Dumped by pg_dump version 15.17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admins (
    id integer NOT NULL,
    "telegramId" text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;


--
-- Name: bot_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bot_users (
    "telegramId" text NOT NULL,
    username text,
    "firstName" text,
    "lastName" text,
    "subscribedToMailing" boolean DEFAULT true NOT NULL,
    "blockedBot" boolean DEFAULT false NOT NULL,
    "firstSeenAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastSeenAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    image text,
    price double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    "productId" text NOT NULL,
    name text NOT NULL,
    price double precision NOT NULL,
    description text,
    specs text,
    image text,
    "fpsImage" text,
    "allImages" text,
    "videoUrl" text,
    "fpsVideoUrl" text,
    "favoriteRank" integer DEFAULT 0,
    "categoryId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "tildaUid" text
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    key text NOT NULL,
    value text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admins (id, "telegramId", name, "createdAt", "updatedAt") FROM stdin;
1	877373058	Admin	2026-04-24 15:58:54.872	2026-04-24 15:58:54.872
2	463029638	Admin	2026-04-24 15:58:54.878	2026-04-24 15:58:54.878
\.


--
-- Data for Name: bot_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bot_users ("telegramId", username, "firstName", "lastName", "subscribedToMailing", "blockedBot", "firstSeenAt", "lastSeenAt") FROM stdin;
463029638	Sininsin	Ruslan	Makarov	t	f	2026-04-29 16:55:09.508	2026-04-29 16:55:09.508
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, description, image, price, "createdAt", "updatedAt") FROM stdin;
1	Full HD	Игровые ПК для разрешения 1920x1080	https://tg-shop.hb.bizmrg.com/categories/full_hd/cover/ab4da7fc-8934-43f9-a239-767d113960d8.webp	\N	2026-04-29 15:18:36.765	2026-04-29 16:16:50.683
2	2K	Игровые ПК для разрешения 2560x1440	https://tg-shop.hb.bizmrg.com/categories/2k/cover/00b365b3-7d2b-40f5-8833-e13011dd855d.webp	\N	2026-04-29 15:18:36.816	2026-04-29 16:16:50.687
3	4K	Игровые ПК для разрешения 3840x2160	https://tg-shop.hb.bizmrg.com/categories/4k/cover/7cdde900-b71c-4212-b6b3-991643f6c23d.webp	\N	2026-04-29 15:18:36.847	2026-04-29 16:16:50.69
4	клавиатуры	Игровые механические и мембранные клавиатуры	https://tg-shop.hb.bizmrg.com/categories/клавиатуры/cover/5dfa5d27-571d-4a56-86e5-bbd90dc9ccea.webp	\N	2026-04-29 15:56:57.376	2026-04-29 16:40:09.067
5	мыши	Игровые мыши, проводные и беспроводные	https://tg-shop.hb.bizmrg.com/categories/мыши/cover/72bd7cc0-17c1-49af-a487-67483be717e6.webp	\N	2026-04-29 15:56:57.384	2026-04-29 16:40:09.076
6	наушники	Игровые наушники	https://tg-shop.hb.bizmrg.com/categories/наушники/cover/fc007520-22e5-4623-b80f-c510a93f776d.webp	\N	2026-04-29 15:56:57.388	2026-04-29 16:40:09.079
7	микрофоны	Игровые и стримерские микрофоны	https://tg-shop.hb.bizmrg.com/categories/микрофоны/cover/d061b3a1-8038-4dc3-9ee9-ca29df99f199.webp	\N	2026-04-29 15:56:57.391	2026-04-29 16:40:09.083
8	мониторы	Игровые мониторы	https://tg-shop.hb.bizmrg.com/categories/мониторы/cover/d5260491-80b9-4aea-bc7d-681882d712e2.webp	\N	2026-04-29 15:56:57.394	2026-04-29 16:40:09.087
9	коврики	Игровые коврики для мыши	https://tg-shop.hb.bizmrg.com/categories/коврики/cover/7a04c772-32f3-46d5-a9b1-95a50c9f485a.webp	\N	2026-04-29 15:56:57.399	2026-04-29 16:40:09.092
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, "productId", name, price, description, specs, image, "fpsImage", "allImages", "videoUrl", "fpsVideoUrl", "favoriteRank", "categoryId", "createdAt", "updatedAt", "tildaUid") FROM stdin;
2	PC-PRIME-2	PRIME 2	86990	\N	{"Процессор":"INTEL CORE I5-13400F","Видеокарта":"NVIDIA RTX 5060 8GB","Память":"DDR4 16GB 8GBX2 RGB","Накопитель":"SSD M.2 500GB","Материнская плата":"H610M DDR4","Охлаждение":"Башенный кулер 180TDP","Блок питания":"600W 80+BRONZE","Корпус":"POWERCASE A3B"}	https://tg-shop.hb.bizmrg.com/products/pc-prime-2/main/134698d6-aa37-432b-ae19-f1d361dbb310.jpg	https://tg-shop.hb.bizmrg.com/products/pc-prime-2/fps/dbe19ed5-91b1-45fa-bb4b-576f12c0338a.png	["https://tg-shop.hb.bizmrg.com/products/pc-prime-2/gallery/95f93a53-696a-4a4d-a120-b2e157b6418a.jpg","https://tg-shop.hb.bizmrg.com/products/pc-prime-2/gallery/7021ac0c-5e03-43fa-925c-26337dcdebc0.jpg","https://tg-shop.hb.bizmrg.com/products/pc-prime-2/gallery/9d87aa69-9f68-4275-986d-fb0f9e3a768c.jpg","https://tg-shop.hb.bizmrg.com/products/pc-prime-2/gallery/7265f722-f35b-407a-b0f6-16ea8248c5a9.jpg"]	https://kinescope.io/crcQvf6qA1S9QNsinuVmay	https://www.youtube.com/watch?v=rwzjMBUDto8&t=9s&ab_channel=PCSupport%26GamingTest	2	1	2026-04-29 15:18:36.794	2026-04-29 16:16:50.596	900940533542
4	PC-PRIME-4	PRIME 4	141990	\N	{"Процессор":"AMD RYZEN 5 7500F","Видеокарта":"NVIDIA RTX 5060 TI 16GB","Память":"DDR5 32GB 16GBX2 RGB","Накопитель":"SSD M.2 1000GB","Материнская плата":"B650M DDR5","Охлаждение":"Башенный кулер 180TDP","Блок питания":"650W 80+BRONZE","Корпус":"1STPLAYER MV5-T"}	https://tg-shop.hb.bizmrg.com/products/pc-prime-4/main/45b1da51-9e4d-4810-b119-8aa8bd6556c5.jpg	https://tg-shop.hb.bizmrg.com/products/pc-prime-4/fps/7b8e19ce-38ed-4aca-bc92-74fd3c119d68.png	["https://tg-shop.hb.bizmrg.com/products/pc-prime-4/gallery/7212e88b-08b0-4a8d-92b8-871643334bc2.jpg","https://tg-shop.hb.bizmrg.com/products/pc-prime-4/gallery/894634b3-1758-4326-a32d-f492591e15a8.jpg","https://tg-shop.hb.bizmrg.com/products/pc-prime-4/gallery/c8b56f3f-d454-4846-9af0-058be16ba220.jpg","https://tg-shop.hb.bizmrg.com/products/pc-prime-4/gallery/b1bbb689-57ce-4154-b439-4d2dbd41a019.jpg"]	https://kinescope.io/5CdA286vNW6diKrPhNQNkY	https://www.youtube.com/watch?v=ozaE9qrg2Eo&ab_channel=ShadowSeven	0	1	2026-04-29 15:18:36.811	2026-04-29 16:16:50.615	734543397742
13	ACC-275533330632	Клавиатура беспроводная AJAZZ AK820 Pro	7290	\N	{"Тип клавиатуры":"механическая","Основной цвет":"черный","Язык раскладки":"русский, английский","Подсветка клавиш":"RGB","Цифровой блок":"нет","Тип переключателей":"Ajazz Flying Fish Switch","Общее количество клавиш":"81","Материал корпуса":"пластик","Интерфейс подключения":"Bluetooth, USB Type-A, радиоканал"}	https://tg-shop.hb.bizmrg.com/accessories/acc-275533330632/main/8728ea64-e9b2-49f9-9115-05216f41efac.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-275533330632/gallery/9971aa2e-d31e-494e-a36a-d693526819df.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-275533330632/gallery/e91fcfb9-82bc-463e-88ea-1ac16ed3a11b.webp"]	\N	\N	0	4	2026-04-29 15:56:57.408	2026-04-29 16:40:09.103	275533330632
8	PC-PHANTOM-4	PHANTOM 4	259990	\N	{"Процессор":"INTEL CORE I7-14700KF","Видеокарта":"NVIDIA RTX 5070 TI 16GB","Память":"DDR5 32GB 16GBX2 RGB","Накопитель":"SSD M.2 1000GB","Материнская плата":"Z790 WIFI DDR5","Охлаждение":"Водяное охлаждение 360ММ","Блок питания":"850W 80+GOLD","Корпус":"PHANTEKS 523 XT"}	https://tg-shop.hb.bizmrg.com/products/pc-phantom-4/main/03304f34-1a3a-4a02-abcf-3fd422b2f56d.jpg	https://tg-shop.hb.bizmrg.com/products/pc-phantom-4/fps/1268b3e8-57f5-4326-9544-1ae562f0d683.png	["https://tg-shop.hb.bizmrg.com/products/pc-phantom-4/gallery/f4bf4940-ee45-420b-8a26-82ca727786fc.jpg","https://tg-shop.hb.bizmrg.com/products/pc-phantom-4/gallery/83d5d4fb-57ac-4117-9053-114ebbe65f86.jpg","https://tg-shop.hb.bizmrg.com/products/pc-phantom-4/gallery/23c5fbf1-0a67-4203-80df-19aef6f07fb2.jpg","https://tg-shop.hb.bizmrg.com/products/pc-phantom-4/gallery/705dfa37-019d-4855-91d9-f86b43cb6eb2.jpg"]	https://kinescope.io/jgCT37Wj3ApV98coTXrDpt	https://www.youtube.com/watch?v=ejIOSJSrwN8&ab_channel=TheSpyHood	0	2	2026-04-29 15:18:36.843	2026-04-29 16:16:50.653	713020952302
10	PC-PULSAR-2	PULSAR 2	315990	\N	{"Процессор":"AMD RYZEN 7 9800X3D","Видеокарта":"NVIDIA RTX 5070 TI 16GB","Память":"DDR5 32GB 16GBX2 RGB","Накопитель":"SSD M.2 1000GB","Материнская плата":"X870 WIFI DDR5","Охлаждение":"Водяное охлаждение 360ММ","Блок питания":"850W 80+GOLD","Корпус":"LIAN LI O11 VISION"}	https://tg-shop.hb.bizmrg.com/products/pc-pulsar-2/main/155e47f3-a55c-4cfe-aa65-93f8cb09a3ac.jpg	https://tg-shop.hb.bizmrg.com/products/pc-pulsar-2/fps/4ebe100e-3e5d-410e-aa3d-058aefab1128.png	["https://tg-shop.hb.bizmrg.com/products/pc-pulsar-2/gallery/65cb5116-22ae-422e-9dcd-c76a696f0f47.jpg","https://tg-shop.hb.bizmrg.com/products/pc-pulsar-2/gallery/71249e18-d695-4215-94b6-5a6b81fa87f4.jpg","https://tg-shop.hb.bizmrg.com/products/pc-pulsar-2/gallery/d079cf91-c4f1-41ef-8a2e-8ac9d2e778a8.jpg","https://tg-shop.hb.bizmrg.com/products/pc-pulsar-2/gallery/34ddb490-d1f2-47a8-a7fa-286610777903.jpg"]	https://kinescope.io/dBM7src9j6BkL3HEgkmHjm	https://www.youtube.com/watch?v=XqGIiPh2C1k&ab_channel=TestingGames	0	3	2026-04-29 15:18:36.859	2026-04-29 16:16:50.668	808100516352
95	ACC-961964762482	23.8" Монитор Xiaomi G24 180ГЦ	12990	\N	{"Диагональ экрана (дюйм)":"23.8","Разрешение экрана":"1920x1080","Тип матрицы":"IPS","Яркость":"250Кд/м²","Частота обновления экрана":"180ГЦ","Время отклика пикселя":"1мс","Технология динамического обновления экрана":"8bit","Видео разъемы":"HDMI/DISPLAY PORT","Регулировка наклона":"есть","Регулировка по высоте":"нет","Комплект":"блок питания, документация, кабель HDMI - HDMI"}	https://tg-shop.hb.bizmrg.com/accessories/acc-961964762482/main/acbbdcf4-7e8c-4d8f-aeda-071bc2b0907e.webp	\N	\N	\N	\N	0	8	2026-04-29 15:56:57.871	2026-04-29 16:40:09.579	961964762482
6	PC-PHANTOM-2	PHANTOM 2	165990	\N	{"Процессор":"AMD RYZEN 5 7500F","Видеокарта":"NVIDIA RTX 5070 12GB","Память":"DDR5 32GB 16GBX2 RGB","Накопитель":"SSD M.2 1000GB","Материнская плата":"B650M DDR5","Охлаждение":"Башенный кулер 180TDP","Блок питания":"750W 80+GOLD","Корпус":"1STPLAYER MV6-T"}	https://tg-shop.hb.bizmrg.com/products/pc-phantom-2/main/dc03fc50-97b1-4bb9-81d3-4169fb7a249c.jpg	https://tg-shop.hb.bizmrg.com/products/pc-phantom-2/fps/c863c436-3fae-4e71-8d71-cc3f0e8bbe21.png	["https://tg-shop.hb.bizmrg.com/products/pc-phantom-2/gallery/4bee92c5-d4c0-4328-90dc-0317cf84fd07.jpg","https://tg-shop.hb.bizmrg.com/products/pc-phantom-2/gallery/3d405a64-e411-4a9c-a07c-6915a7fac80c.jpg","https://tg-shop.hb.bizmrg.com/products/pc-phantom-2/gallery/57183b5a-77f5-4d0a-9334-41c6ad445872.jpg","https://tg-shop.hb.bizmrg.com/products/pc-phantom-2/gallery/c26ca375-a31e-4968-abf6-897934855f2e.jpg"]	https://kinescope.io/rHBMUN1osa7mFdZ4rcHgeD	https://www.youtube.com/watch?v=OYOatgMn24g&ab_channel=ShadowSeven	0	2	2026-04-29 15:18:36.83	2026-04-29 16:16:50.637	221660190822
9	PC-PULSAR-1	PULSAR 1	261990	\N	{"Процессор":"AMD RYZEN 7 7800X3D","Видеокарта":"NVIDIA RTX 5070 TI 16GB","Память":"DDR5 32GB 16GBX2 RGB","Накопитель":"SSD M.2 1000GB","Материнская плата":"B850M WIFI DDR5","Охлаждение":"Водяное охлаждение 360ММ","Блок питания":"850W 80+GOLD","Корпус":"JONSBO D300"}	https://tg-shop.hb.bizmrg.com/products/pc-pulsar-1/main/ae8c453c-16ac-41c6-86b6-ff3d9ea5a890.jpg	https://tg-shop.hb.bizmrg.com/products/pc-pulsar-1/fps/2d492e8a-fbc6-4f6e-a5cb-c99f6c5abf8d.png	["https://tg-shop.hb.bizmrg.com/products/pc-pulsar-1/gallery/3f9e81de-44eb-48e0-8923-1290a6285597.jpg","https://tg-shop.hb.bizmrg.com/products/pc-pulsar-1/gallery/415bbf68-ce6c-4cb8-8fc3-0e3bb7f826dc.jpg","https://tg-shop.hb.bizmrg.com/products/pc-pulsar-1/gallery/a0a71672-be6f-4e72-ac76-e162e9db9609.jpg","https://tg-shop.hb.bizmrg.com/products/pc-pulsar-1/gallery/a6a81ef1-6980-4c31-8a90-e95ab47ef215.jpg"]	https://kinescope.io/x1BuMnEcZWqW6swjwMVdNA	https://www.youtube.com/watch?v=QTkpoMOQNas&ab_channel=TestingGames	4	3	2026-04-29 15:18:36.853	2026-04-29 16:16:50.662	103018678892
30	ACC-861986894722	Мышь беспроводная/проводная AJAZZ AJ159 APEX WHITE	6890	\N	{"Разрешение датчика":"42000 dpi","Общее количество кнопок":"5","Подсветка":"RGB","Основной цвет":"белый","Модель сенсора":"PixArt PAW3950","Хват":"для правой руки","Частота опроса":"8000 Гц","Интерфейс подключения":"Bluetooth, радиоканал, USB Type-A, USB Type-C, док станция с дисплеем.","Длина кабеля":"1.5м","Вес":"60г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-861986894722/main/e4407c21-a032-4e24-967e-6716e8dc6b79.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-861986894722/gallery/6555ffc3-5add-476e-850a-2fabcb3696a6.webp"]	\N	\N	0	5	2026-04-29 15:56:57.476	2026-04-29 16:40:09.227	861986894722
3	PC-PRIME-3	PRIME 3	108990	\N	{"Процессор":"AMD RYZEN 5 7500F","Видеокарта":"NVIDIA RTX 5060 8GB","Память":"DDR5 32GB 16GBX2 RGB","Накопитель":"SSD M.2 1000GB","Материнская плата":"B650M DDR5","Охлаждение":"Башенный кулер 180TDP","Блок питания":"600W 80+BRONZE","Корпус":"1STPLAYER TRILOBITE T3"}	https://tg-shop.hb.bizmrg.com/products/pc-prime-3/main/927d9aac-913e-4208-96d6-1b3652747fd9.jpg	https://tg-shop.hb.bizmrg.com/products/pc-prime-3/fps/9488546a-8f32-4434-b8be-a122b6b3bf0d.png	["https://tg-shop.hb.bizmrg.com/products/pc-prime-3/gallery/1b63c79a-ecbd-45dc-aecb-a3bcaeba3223.jpg","https://tg-shop.hb.bizmrg.com/products/pc-prime-3/gallery/cea88bf9-0628-4fbe-ba9a-1605d7c3d78b.jpg","https://tg-shop.hb.bizmrg.com/products/pc-prime-3/gallery/3060217e-df13-4b20-9e12-10efdbfe310b.jpg","https://tg-shop.hb.bizmrg.com/products/pc-prime-3/gallery/b49b4a55-db6e-482f-becd-ee63dc9e9857.jpg"]	https://www.youtube.com/watch?v=5PVuvKmtke0&t=554s&ab_channel=PCSupport%26GamingTest	https://kinescope.io/cwzMGpTXJ1cL8af3LtXkGx	0	1	2026-04-29 15:18:36.801	2026-04-29 16:16:50.603	536964114172
7	PC-PHANTOM-3	PHANTOM 3	178990	\N	{"Процессор":"AMD RYZEN 7 7700","Видеокарта":"NVIDIA RTX 5070 12GB","Память":"DDR5 32GB 16GBX2 RGB","Накопитель":"SSD M.2 1000GB","Материнская плата":"B650M DDR5","Охлаждение":"Водяное охлаждение 360ММ","Блок питания":"750W 80+GOLD","Корпус":"ZALMAN P30"}	https://tg-shop.hb.bizmrg.com/products/pc-phantom-3/main/ca89724d-2b65-4593-9a19-84115e37889b.jpg	https://tg-shop.hb.bizmrg.com/products/pc-phantom-3/fps/843a3ea8-fea0-41a0-beba-58c8c6af0353.png	["https://tg-shop.hb.bizmrg.com/products/pc-phantom-3/gallery/607855d2-e2f5-4af4-8590-fd4bcb660135.jpg","https://tg-shop.hb.bizmrg.com/products/pc-phantom-3/gallery/ba585cf0-8e88-410a-bcf4-7131244ba6fd.jpg","https://tg-shop.hb.bizmrg.com/products/pc-phantom-3/gallery/8844a8d2-bd1f-4e60-9aa0-894e1c0950f4.jpg","https://tg-shop.hb.bizmrg.com/products/pc-phantom-3/gallery/caee2a09-f9e2-4ba9-b29b-7897cc568340.jpg"]	https://kinescope.io/8isaGWz7nBeKwCGEZTzW4w	https://www.youtube.com/watch?v=DcaCfoKrAqs&ab_channel=ShadowSeven	0	2	2026-04-29 15:18:36.837	2026-04-29 16:16:50.646	559836557872
16	ACC-825999520172	Клавиатура беспроводная Keychron K8 Pro	16990	\N	{"Тип клавиатуры":"механическая","Основной цвет":"черный","Язык раскладки":"русский, английский","Подсветка клавиш":"RGB","Цифровой блок":"нет","Тип переключателей":"Keychron K Pro Blue","Общее количество клавиш":"87","Материал корпуса":"металл, пластик","Интерфейс подключения":"Bluetooth, USB Type-A, радиоканал"}	https://tg-shop.hb.bizmrg.com/accessories/acc-825999520172/main/7a5da827-8f75-45ab-8856-2bdda1ede1a9.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-825999520172/gallery/0649c3fb-1b77-496f-ac77-3aeb525968b6.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-825999520172/gallery/e33c44da-8992-4839-bd0e-edce8653cfd8.webp"]	\N	\N	0	4	2026-04-29 15:56:57.425	2026-04-29 16:40:09.124	825999520172
17	ACC-791450288922	Клавиатура беспроводная Machenike KT68 Smart Screen	13590	\N	{"Тип клавиатуры":"механическая","Основной цвет":"черный","Язык раскладки":"русский, английский","Подсветка клавиш":"RGB","Цифровой блок":"нет, есть настраиваемый дисплей","Тип переключателей":"Gateron Yellow Pro 3.0","Общее количество клавиш":"68","Материал корпуса":"пластик","Интерфейс подключения":"Bluetooth, USB Type-A, радиоканал"}	https://tg-shop.hb.bizmrg.com/accessories/acc-791450288922/main/b3f46ed5-b891-46e0-b256-437f1432d4f0.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-791450288922/gallery/39e81262-c7fc-4978-853c-8f691e80c3a8.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-791450288922/gallery/c480e321-e48e-41c2-987a-bc8998857d5b.webp"]	\N	\N	0	4	2026-04-29 15:56:57.429	2026-04-29 16:40:09.13	791450288922
18	ACC-255154022822	Клавиатура беспроводная Nuphy AIR75v2	17990	\N	{"Тип клавиатуры":"механическая","Основной цвет":"черный","Язык раскладки":"русский, английский","Подсветка клавиш":"RGB","Цифровой блок":"нет","Тип переключателей":"Gateron Low-profile 2.0 Brown","Общее количество клавиш":"84","Материал корпуса":"алюминий, пластик","Интерфейс подключения":"Bluetooth, USB Type-A, радиоканал"}	https://tg-shop.hb.bizmrg.com/accessories/acc-255154022822/main/f0f3f83a-c504-4e71-9da0-046216e0279c.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-255154022822/gallery/d7317a9a-06f9-4e5d-835c-d32e062850ab.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-255154022822/gallery/7d4c8ab3-860a-4421-be6a-743aa969d434.webp"]	\N	\N	0	4	2026-04-29 15:56:57.433	2026-04-29 16:40:09.136	255154022822
19	ACC-799707137862	Клавиатура беспроводная WOB Rainy 75 pro	16390	\N	{"Тип клавиатуры":"механическая","Основной цвет":"черный","Язык раскладки":"русский, английский","Подсветка клавиш":"RGB","Цифровой блок":"нет","Тип переключателей":"Cocoa Linear Switches(Kaih)","Общее количество клавиш":"81","Материал корпуса":"металл","Аккумулятор":"7000мАч","Интерфейс подключения":"Bluetooth, USB Type-A, радиоканал","Вес":"2.3кг"}	https://tg-shop.hb.bizmrg.com/accessories/acc-799707137862/main/1d0bf2b1-cfda-404a-93d5-c32ae11b8cd2.webp	\N	\N	\N	\N	0	4	2026-04-29 15:56:57.436	2026-04-29 16:40:09.142	799707137862
20	ACC-201906271382	Клавиатура проводная A4Tech Bloody Q100	2590	\N	{"Тип клавиатуры":"мембранная","Основной цвет":"черный","Язык раскладки":"русский, английский","Подсветка клавиш":"есть","Цифровой блок":"есть","Общее количество клавиш":"104","Материал корпуса":"пластик","Интерфейс подключения":"USB Type-A","Длина кабеля":"1.8м"}	https://tg-shop.hb.bizmrg.com/accessories/acc-201906271382/main/a7081622-d77d-4243-a3d9-c367bc43640d.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-201906271382/gallery/f26b58eb-892e-499c-9594-1d664172dac1.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-201906271382/gallery/a50ee2ed-3af4-46c2-ad7c-b8765e4daa91.webp"]	\N	\N	0	4	2026-04-29 15:56:57.44	2026-04-29 16:40:09.147	201906271382
21	ACC-600774301592	Клавиатура проводная Akko 5087S	10490	\N	{"Тип клавиатуры":"механическая","Основной цвет":"черный","Язык раскладки":"русский, английский","Подсветка клавиш":"RGB","Цифровой блок":"нет","Тип переключателей":"Akko V3 Cream Yellow PRO Switch","Общее количество клавиш":"87","Материал корпуса":"пластик","Интерфейс подключения":"USB Type-A","Длина кабеля":"1.5м"}	https://tg-shop.hb.bizmrg.com/accessories/acc-600774301592/main/adab64cd-7410-4b39-b66d-bb48fbce4d00.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-600774301592/gallery/9438d9fe-27f7-441d-9ce6-c28b835c4c37.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-600774301592/gallery/d5551616-d999-44df-ab53-c4a48881ac8c.webp"]	\N	\N	0	4	2026-04-29 15:56:57.443	2026-04-29 16:40:09.153	600774301592
15	ACC-206884045532	Клавиатура беспроводная ASUS X901 Strix Scope II 96 WHITE	22990	\N	{"Тип клавиатуры":"механическая","Основной цвет":"белый","Язык раскладки":"русский, английский","Подсветка клавиш":"RGB","Цифровой блок":"есть","Тип переключателей":"ROG NX Snow","Общее количество клавиш":"98","Материал корпуса":"пластик","Интерфейс подключения":"Bluetooth, USB Type-A, радиоканал"}	https://tg-shop.hb.bizmrg.com/accessories/acc-206884045532/main/4e6b4748-8342-459c-b3ad-66781341c32c.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-206884045532/gallery/9010179d-d890-4bca-aac0-a5f80a5eaf6f.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-206884045532/gallery/c2526860-f973-403d-80a2-ce685b81a566.webp"]	\N	\N	0	4	2026-04-29 15:56:57.42	2026-04-29 16:40:09.118	206884045532
24	ACC-874766158902	Клавиатура проводная MSI Vigor GK30 White	4690	\N	{"Тип клавиатуры":"плунжерная","Основной цвет":"белый","Язык раскладки":"русский, английский","Подсветка клавиш":"RGB","Цифровой блок":"есть","Общее количество клавиш":"104","Материал корпуса":"пластик","Интерфейс подключения":"USB Type-A","Длина кабеля":"1.8м"}	https://tg-shop.hb.bizmrg.com/accessories/acc-874766158902/main/d217bf82-0f96-481a-8039-c19faae617a8.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-874766158902/gallery/3dd1ea30-06e3-4912-b5b9-173ed811cbf1.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-874766158902/gallery/64add73b-b5c5-45f2-bf55-974b9c207beb.webp"]	\N	\N	0	4	2026-04-29 15:56:57.454	2026-04-29 16:40:09.173	874766158902
25	ACC-550707949762	Клавиатура проводная Razer Ornata V3	7990	\N	{"Тип клавиатуры":"мембранная (частично механика)","Основной цвет":"черный","Язык раскладки":"русский, английский","Подсветка клавиш":"RGB","Цифровой блок":"есть","Общее количество клавиш":"108","Материал корпуса":"пластик","Интерфейс подключения":"USB Type-A","Длина кабеля":"2м"}	https://tg-shop.hb.bizmrg.com/accessories/acc-550707949762/main/87f2b0cf-180c-4bfb-b051-a0fd78bb37d3.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-550707949762/gallery/abd1cabc-162a-4728-ac42-6c0d7e175019.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-550707949762/gallery/95067d82-2335-4094-b4f2-2f70495e2b24.webp"]	\N	\N	0	4	2026-04-29 15:56:57.458	2026-04-29 16:40:09.179	550707949762
26	ACC-827512116732	Мышь беспроводная Logitech G PRO X SUPERLIGHT 2	20990	\N	{"Разрешение датчика":"44000 dpi","Общее количество кнопок":"5","Подсветка":"RGB","Основной цвет":"черный","Модель сенсора":"HERO 2","Хват":"для правой руки","Частота опроса":"8000 Гц","Интерфейс подключения":"Bluetooth, радиоканал, USB Type-A","Аккумулятор":"до 95ч","Длина кабеля":"2м","Вес":"60г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-827512116732/main/f1af015d-ad6e-4790-91cc-1a947c2e5fbf.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-827512116732/gallery/79dde79d-11d4-4584-92f9-d041ba565a68.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-827512116732/gallery/88fee7c6-5835-4ecd-95ef-d2acdb6e231e.webp"]	\N	\N	0	5	2026-04-29 15:56:57.462	2026-04-29 16:40:09.185	827512116732
27	ACC-133585959962	Мышь беспроводная Logitech G PRO X SUPERLIGHT 2 WHITE	20990	\N	{"Разрешение датчика":"44000 dpi","Общее количество кнопок":"5","Подсветка":"RGB","Основной цвет":"белый","Модель сенсора":"HERO 2","Хват":"для правой руки","Частота опроса":"8000 Гц","Интерфейс подключения":"Bluetooth, радиоканал, USB Type-A","Аккумулятор":"до 95ч","Длина кабеля":"2м","Вес":"60г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-133585959962/main/7fc145f1-a729-489e-8ac6-1fff4ff565da.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-133585959962/gallery/5530600d-3f60-4df0-8276-8b4f5bfd53be.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-133585959962/gallery/e6c2da39-f3ac-442a-a345-5894fc026767.webp"]	\N	\N	0	5	2026-04-29 15:56:57.466	2026-04-29 16:40:09.212	133585959962
28	ACC-171951953222	Мышь беспроводная Logitech Gaming Mouse G703	8290	\N	{"Разрешение датчика":"25600 dpi","Общее количество кнопок":"6","Подсветка":"RGB","Основной цвет":"черный","Модель сенсора":"HERO 25K","Хват":"для правой руки","Частота опроса":"1000 Гц","Интерфейс подключения":"радиоканал, USB Type-A","Аккумулятор":"до 60ч","Длина кабеля":"1.8м","Вес":"95г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-171951953222/main/196ad1e2-91dd-4746-bc89-20fc8edab064.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-171951953222/gallery/77bf3d19-ebc6-4218-898b-668343995e42.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-171951953222/gallery/397c85da-a40d-4b2a-96dd-be064db770c8.webp"]	\N	\N	0	5	2026-04-29 15:56:57.47	2026-04-29 16:40:09.217	171951953222
29	ACC-998347211932	Мышь беспроводная/проводная AJAZZ AJ159 APEX	6890	\N	{"Разрешение датчика":"42000 dpi","Общее количество кнопок":"5","Подсветка":"RGB","Основной цвет":"черный","Модель сенсора":"PixArt PAW3950","Хват":"для правой руки","Частота опроса":"8000 Гц","Интерфейс подключения":"Bluetooth, радиоканал, USB Type-A, USB Type-C, док станция с дисплеем.","Длина кабеля":"1.5м","Вес":"60г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-998347211932/main/2c3e289b-9121-434e-a655-534cc04071bc.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-998347211932/gallery/d8c15d50-e6ff-4d2f-880f-aedeee0b639a.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-998347211932/gallery/a1422efc-963a-4a16-9202-72b815c857df.webp"]	\N	\N	0	5	2026-04-29 15:56:57.473	2026-04-29 16:40:09.222	998347211932
23	ACC-659749536322	Клавиатура проводная MSI Vigor GK30 Black	4890	\N	{"Тип клавиатуры":"плунжерная","Основной цвет":"черный","Язык раскладки":"русский, английский","Подсветка клавиш":"RGB","Цифровой блок":"есть","Общее количество клавиш":"104","Материал корпуса":"пластик","Интерфейс подключения":"USB Type-A","Длина кабеля":"1.8м"}	https://tg-shop.hb.bizmrg.com/accessories/acc-659749536322/main/ff5d418e-e775-4e33-87b3-014e4801c65d.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-659749536322/gallery/bddfecf7-aa46-4f9c-a0ba-d350e55675e9.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-659749536322/gallery/3eef2874-1d73-402e-99d6-dc80a67de824.webp"]	\N	\N	0	4	2026-04-29 15:56:57.45	2026-04-29 16:40:09.166	659749536322
34	ACC-715528460212	Мышь беспроводная/проводная ASUS ROG Keris II ACE WHITE	20190	\N	{"Разрешение датчика":"42000dpi","Общее количество кнопок":"5","Подсветка":"RGB","Основной цвет":"белый","Модель сенсора":"ROG AimPoint Pro","Хват":"для правой руки","Частота опроса":"8000 Гц","Интерфейс подключения":"Bluetooth, радиоканал, USB Type-A","Аккумулятор":"до 107ч","Длина кабеля":"2м","Вес":"54г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-715528460212/main/5dbb3eb3-90e8-4786-b439-3320ea6be675.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-715528460212/gallery/b3db215d-8d8d-440f-afa9-4ece30748835.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-715528460212/gallery/5246f775-fcd9-414f-bfcb-9c13a30ac13d.webp"]	\N	\N	0	5	2026-04-29 15:56:57.49	2026-04-29 16:40:09.247	715528460212
35	ACC-114420821362	Мышь беспроводная/проводная Ajazz AJ139 V2 MC	2190	\N	{"Разрешение датчика":"3200 dpi","Общее количество кнопок":"6","Подсветка":"RGB","Основной цвет":"черный","Модель сенсора":"PixArt PAW3311","Хват":"для правой и левой руки","Частота опроса":"125 Гц, 1000 Гц","Режимы работы датчика":"400 dpi, 3200 dpi","Интерфейс подключения":"Bluetooth, радиоканал, USB Type-A","Длина кабеля":"1.5м","Вес":"66г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-114420821362/main/3acb88ae-997e-4544-9c82-ea66ed812ef1.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-114420821362/gallery/f6fb4fa4-ee56-4361-8d58-75fe2aeee8ca.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-114420821362/gallery/97596f69-7a6f-4d86-9741-5780a04ac526.webp"]	\N	\N	0	5	2026-04-29 15:56:57.493	2026-04-29 16:40:09.251	114420821362
37	ACC-879224950072	Мышь беспроводная/проводная MSI Clutch GM51 Lightweight	11190	\N	{"Разрешение датчика":"26000 dpi","Общее количество кнопок":"6","Подсветка":"RGB","Основной цвет":"черный","Модель сенсора":"PixArt PAW3395","Хват":"для правой руки","Частота опроса":"1000 Гц","Интерфейс подключения":"Bluetooth, радиоканал, USB Type-A","Аккумулятор":"до 150ч","Длина кабеля":"2м","Вес":"85г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-879224950072/main/270d1164-6f8f-4379-babd-d087506d2e4e.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-879224950072/gallery/55ce41c5-df59-430f-81fb-6796770aad2f.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-879224950072/gallery/b65576d2-c24c-41b4-97c4-2cb2cc773630.webp"]	\N	\N	0	5	2026-04-29 15:56:57.5	2026-04-29 16:40:09.261	879224950072
38	ACC-951001542482	Мышь проводная Logitech G102 LIGHTSYNC BLACK	2890	\N	{"Разрешение датчика":"8000 dpi","Общее количество кнопок":"6","Подсветка":"RGB","Основной цвет":"черный","Модель сенсора":"Mercury","Хват":"для правой и левой руки","Частота опроса":"1000 Гц","Режимы работы датчика":"200 dpi, 8000 dpi","Интерфейс подключения":"USB Type-A","Длина кабеля":"2.1м","Вес":"85г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-951001542482/main/b4071a31-4e32-43cc-a4ff-291eaf2291e5.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-951001542482/gallery/3be4edc9-0f5e-44d1-ac25-1e489599dd13.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-951001542482/gallery/fdc45e64-fccd-44ae-bfed-1478efc91619.webp"]	\N	\N	0	5	2026-04-29 15:56:57.504	2026-04-29 16:40:09.266	951001542482
32	ACC-156851732372	Мышь беспроводная/проводная AJAZZ AJ159 NL WHITE	3090	\N	{"Разрешение датчика":"12000 dpi","Общее количество кнопок":"6","Подсветка":"RGB","Основной цвет":"белый","Модель сенсора":"PixArt PAW3311","Хват":"для правой руки","Частота опроса":"1000 Гц","Интерфейс подключения":"Bluetooth, радиоканал, USB Type-A, USB Type-C","Длина кабеля":"1.5м","Вес":"61г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-156851732372/main/88842d6e-ec42-4e3e-bbb5-5126292c8386.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-156851732372/gallery/a12b9ba5-3e49-44a0-8864-b8c2faab3648.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-156851732372/gallery/8e69be7f-9035-40a3-aa9e-4c3e7f1dee8f.webp"]	\N	\N	0	5	2026-04-29 15:56:57.483	2026-04-29 16:40:09.238	156851732372
33	ACC-343553617832	Мышь беспроводная/проводная ASUS ROG Keris II ACE	20190	\N	{"Разрешение датчика":"42000dpi","Общее количество кнопок":"5","Подсветка":"RGB","Основной цвет":"черный","Модель сенсора":"ROG AimPoint Pro","Хват":"для правой руки","Частота опроса":"8000 Гц","Интерфейс подключения":"Bluetooth, радиоканал, USB Type-A","Аккумулятор":"до 107ч","Длина кабеля":"2м","Вес":"54г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-343553617832/main/35880b4c-f527-4556-a0dc-080a4aa1f32f.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-343553617832/gallery/cd591fe1-6fc5-4850-bccf-c2979a0b7c69.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-343553617832/gallery/00f70f98-8aed-47f0-91a4-15807f37fc0b.webp"]	\N	\N	0	5	2026-04-29 15:56:57.487	2026-04-29 16:40:09.242	343553617832
41	ACC-964183480102	Мышь проводная MSI Clutch GM11 BLACK	2790	\N	{"Разрешение датчика":"5000 dpi","Общее количество кнопок":"6","Подсветка":"RGB","Основной цвет":"черный","Модель сенсора":"PixArt PMW3325","Хват":"для правой и левой руки","Частота опроса":"1000 Гц","Режимы работы датчика":"400 dpi, 800 dpi, 1600 dpi, 3200 dpi, 5000 dpi","Интерфейс подключения":"USB Type-A","Длина кабеля":"1.8м","Вес":"89г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-964183480102/main/2f3a29c3-0bc5-4b69-aa7c-e9e9a8981d77.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-964183480102/gallery/dfaa3055-83a0-4efe-8cf0-c5f07c265318.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-964183480102/gallery/c0cc6b1a-14cf-4f59-8836-7bfbcb1a2a38.webp"]	\N	\N	0	5	2026-04-29 15:56:57.515	2026-04-29 16:40:09.285	964183480102
42	ACC-255365606842	Мышь проводная MSI Clutch GM11 WHITE	2590	\N	{"Разрешение датчика":"5000 dpi","Общее количество кнопок":"6","Подсветка":"RGB","Основной цвет":"белый","Модель сенсора":"PixArt PMW3325","Хват":"для правой и левой руки","Частота опроса":"1000 Гц","Режимы работы датчика":"400 dpi, 800 dpi, 1600 dpi, 3200 dpi, 5000 dpi","Интерфейс подключения":"USB Type-A","Длина кабеля":"1.8м","Вес":"89г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-255365606842/main/d18f2581-e4d2-4a61-bd69-8da3b669c53e.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-255365606842/gallery/fbd3c8b9-e379-4b3a-b5d3-f5204f645298.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-255365606842/gallery/684a25c9-040a-4d85-9392-6e5a60be5241.webp"]	\N	\N	0	5	2026-04-29 15:56:57.519	2026-04-29 16:40:09.29	255365606842
43	ACC-433775196512	Мышь проводная Razer Basilisk V3	7290	\N	{"Разрешение датчика":"26000 dpi","Общее количество кнопок":"11","Подсветка":"RGB","Основной цвет":"черный","Модель сенсора":"Razer Focus+","Хват":"для правой руки","Частота опроса":"1000 Гц","Режимы работы датчика":"26000 dpi","Интерфейс подключения":"USB Type-A","Длина кабеля":"1.8м","Вес":"101г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-433775196512/main/698d4aa2-bb8b-44df-86db-d0e101549fde.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-433775196512/gallery/ccdbb4db-a521-4e2b-9d9e-93ee9fa31d26.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-433775196512/gallery/027b6b52-efa7-4e44-bd71-4212d9b261f8.webp"]	\N	\N	0	5	2026-04-29 15:56:57.523	2026-04-29 16:40:09.295	433775196512
44	ACC-606153511132	Мышь проводная Razer DeathAdder V3	8490	\N	{"Разрешение датчика":"30000 dpi","Общее количество кнопок":"6","Подсветка":"нет","Основной цвет":"черный","Модель сенсора":"Razer Focus Pro","Хват":"для правой руки","Частота опроса":"1000 Гц, 8000 Гц","Режимы работы датчика":"400 dpi, 800 dpi, 1600 dpi, 3200 dpi, 6400 dpi, 30000 dpi","Интерфейс подключения":"USB Type-A","Длина кабеля":"1.8м","Вес":"59г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-606153511132/main/0efafdf6-62e0-41fd-bc03-f81bb243a8c5.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-606153511132/gallery/82b43588-1d0d-4dee-bdd5-1a32caceed26.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-606153511132/gallery/9e092483-ce38-4b7a-b533-42718d3348f2.webp"]	\N	\N	0	5	2026-04-29 15:56:57.531	2026-04-29 16:40:09.3	606153511132
45	ACC-261457365902	Беспроводные наушники Logitech G435	9790	\N	{"Тип конструкции":"охватывающие","Материал амбушюр":"ткань","Складные":"нет","Подсветка":"нет","Формат звуковой схемы":"2.0","Минимальная воспроизводимая частота":"20 Гц","Максимальная воспроизводимая частота":"20000 Гц","Сопротивление (импеданс)":"45Ω","Микрофон":"есть","Съемный микрофон":"нет","Разъем для подключения к устройству":"Bluetooth, радиоканал","Вес":"165г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-261457365902/main/8ba7e066-beab-4a3e-b54b-513dacd8c66b.webp	\N	\N	\N	\N	0	6	2026-04-29 15:56:57.537	2026-04-29 16:40:09.305	261457365902
46	ACC-698326813312	Беспроводные наушники Logitech G435 WHITE	10290	\N	{"Тип конструкции":"охватывающие","Материал амбушюр":"ткань","Складные":"нет","Подсветка":"нет","Формат звуковой схемы":"2.0","Минимальная воспроизводимая частота":"20 Гц","Максимальная воспроизводимая частота":"20000 Гц","Сопротивление (импеданс)":"45Ω","Микрофон":"есть","Съемный микрофон":"нет","Разъем для подключения к устройству":"Bluetooth, радиоканал","Вес":"165г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-698326813312/main/dd99beec-9513-4f0a-a153-5baa8e989122.webp	\N	\N	\N	\N	0	6	2026-04-29 15:56:57.544	2026-04-29 16:40:09.31	698326813312
40	ACC-452724959422	Мышь проводная Logitech G403 HERO	5890	\N	{"Разрешение датчика":"25600 dpi","Общее количество кнопок":"6","Подсветка":"RGB","Основной цвет":"черный","Модель сенсора":"HERO 25K","Хват":"для правой руки","Частота опроса":"1000 Гц","Режимы работы датчика":"100 dpi, 25600 dpi","Интерфейс подключения":"USB Type-A","Длина кабеля":"2.1м","Вес":"87.3г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-452724959422/main/48e9ef3d-cc74-40ab-89a0-faa48193693d.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-452724959422/gallery/ea90ec5d-80e8-4819-a412-02756530272e.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-452724959422/gallery/59a6a383-ab68-437b-a1d2-6f3153461140.webp"]	\N	\N	0	5	2026-04-29 15:56:57.51	2026-04-29 16:40:09.279	452724959422
49	ACC-745046639062	Беспроводные наушники Razer Blackshark V2 Pro	25490	\N	{"Тип конструкции":"охватывающие","Материал амбушюр":"мягкая пена","Складные":"нет","Подсветка":"нет","Формат звуковой схемы":"2.0","Минимальная воспроизводимая частота":"12 Гц","Максимальная воспроизводимая частота":"28000 Гц","Сопротивление (импеданс)":"32Ω","Микрофон":"есть","Съемный микрофон":"есть","Разъем для подключения к устройству":"bluetooth, радиоканал, провод","Вес":"320г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-745046639062/main/b13900bb-6cf6-4a1d-a11f-55e143dd8c25.webp	\N	\N	\N	\N	0	6	2026-04-29 15:56:57.565	2026-04-29 16:40:09.327	745046639062
50	ACC-252278306672	Беспроводные/проводные наушники Razer Barracuda X WHITE	12560	\N	{"Тип конструкции":"охватывающие","Материал амбушюр":"ткань","Складные":"нет","Подсветка":"нет","Формат звуковой схемы":"7.1 Virtual","Минимальная воспроизводимая частота":"20 Гц","Максимальная воспроизводимая частота":"20000 Гц","Сопротивление (импеданс)":"32Ω","Микрофон":"есть","Съемный микрофон":"есть","Разъем для подключения к устройству":"Bluetooth, радиоканал, провод","Вес":"250г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-252278306672/main/c6a35d01-5e9d-4156-87f4-36c96b6b590d.webp	\N	\N	\N	\N	0	6	2026-04-29 15:56:57.572	2026-04-29 16:40:09.332	252278306672
51	ACC-412033031202	Беспроводные/проводные наушники A4Tech Bloody MR710 WHITE	8190	\N	{"Тип конструкции":"охватывающие","Материал амбушюр":"ткань","Складные":"нет","Подсветка":"разноцветная","Формат звуковой схемы":"7.1 Virtual","Минимальная воспроизводимая частота":"20 Гц","Максимальная воспроизводимая частота":"20000 Гц","Сопротивление (импеданс)":"16Ω","Микрофон":"есть","Съемный микрофон":"нет","Длина кабеля":"1.5м","Разъем для подключения к устройству":"Bluetooth, проводной, радиоканал, 5.0, кабель - 1.5 м jack 3.5 мм","Вес":"335г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-412033031202/main/ae7a9366-4bc8-4cfb-9812-dfef83fc1a5f.webp	\N	\N	\N	\N	0	6	2026-04-29 15:56:57.579	2026-04-29 16:40:09.338	412033031202
52	ACC-118474418162	Беспроводные/проводные наушники Logitech PRO X 2	33590	\N	{"Тип конструкции":"охватывающие","Материал амбушюр":"мягкая пена, экокожа","Складные":"нет","Подсветка":"нет","Формат звуковой схемы":"2.0","Минимальная воспроизводимая частота":"20 Гц","Максимальная воспроизводимая частота":"20000 Гц","Сопротивление (импеданс)":"38Ω","Микрофон":"есть","Съемный микрофон":"есть","Разъем для подключения к устройству":"bluetooth, радиоканал, провод","Вес":"354г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-118474418162/main/696e0147-77b0-409f-8961-e51a33400f2c.webp	\N	\N	\N	\N	0	6	2026-04-29 15:56:57.585	2026-04-29 16:40:09.343	118474418162
53	ACC-209195980522	Беспроводные/проводные наушники Logitech PRO X 2 WHITE	33590	\N	{"Тип конструкции":"охватывающие","Материал амбушюр":"мягкая пена, экокожа","Складные":"нет","Подсветка":"нет","Формат звуковой схемы":"2.0","Минимальная воспроизводимая частота":"20 Гц","Максимальная воспроизводимая частота":"20000 Гц","Сопротивление (импеданс)":"38Ω","Микрофон":"есть","Съемный микрофон":"есть","Разъем для подключения к устройству":"bluetooth, радиоканал, провод","Вес":"354г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-209195980522/main/b593cd9a-a367-4581-b4ee-30c99cb9c89f.webp	\N	\N	\N	\N	0	6	2026-04-29 15:56:57.591	2026-04-29 16:40:09.347	209195980522
54	ACC-900863809042	Беспроводные/проводные наушники Razer Barracuda X	12560	\N	{"Тип конструкции":"охватывающие","Материал амбушюр":"ткань","Складные":"нет","Подсветка":"нет","Формат звуковой схемы":"7.1 Virtual","Минимальная воспроизводимая частота":"20 Гц","Максимальная воспроизводимая частота":"20000 Гц","Сопротивление (импеданс)":"32Ω","Микрофон":"есть","Съемный микрофон":"есть","Разъем для подключения к устройству":"Bluetooth, радиоканал, провод","Вес":"250г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-900863809042/main/e3375672-dea8-4af7-8e8e-7772fcc8fb2d.webp	\N	\N	\N	\N	0	6	2026-04-29 15:56:57.597	2026-04-29 16:40:09.352	900863809042
48	ACC-224770629302	Беспроводные наушники Logitech G733 WHITE	20990	\N	{"Тип конструкции":"охватывающие","Материал амбушюр":"мягкая пена, ткань","Складные":"нет","Подсветка":"разноцветная","Формат звуковой схемы":"7.1 Virtual","Минимальная воспроизводимая частота":"20 Гц","Максимальная воспроизводимая частота":"20000 Гц","Сопротивление (импеданс)":"39Ω","Микрофон":"есть","Съемный микрофон":"есть","Разъем для подключения к устройству":"радиоканал, провод","Вес":"278г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-224770629302/main/20ca791d-b6c9-4ade-9c4e-3782e22ff25e.webp	\N	\N	\N	\N	0	6	2026-04-29 15:56:57.558	2026-04-29 16:40:09.321	224770629302
57	ACC-607238526332	Проводные наушники HyperX Cloud III	13440	\N	{"Тип конструкции":"охватывающие","Материал амбушюр":"мягкая пена, экокожа","Складные":"нет","Подсветка":"нет","Формат звуковой схемы":"7.1 Virtual","Минимальная воспроизводимая частота":"10 Гц","Максимальная воспроизводимая частота":"21000 Гц","Сопротивление (импеданс)":"60Ω","Микрофон":"есть","Съемный микрофон":"есть","Длина кабеля":"1.2м","Разъем для подключения к устройству":"USB Type-C, микрофон, переходник USB Type-C - USB Type-A","Вес":"304г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-607238526332/main/b1102fc6-45e9-4937-a422-cf4fd0bd770f.webp	\N	\N	\N	\N	0	6	2026-04-29 15:56:57.618	2026-04-29 16:40:09.368	607238526332
58	ACC-400305545432	Проводные наушники HyperX Cloud Stinger 2	5460	\N	{"Тип конструкции":"охватывающие","Материал амбушюр":"мягкая пена, экокожа","Складные":"нет","Подсветка":"нет","Формат звуковой схемы":"2.0","Минимальная воспроизводимая частота":"10 Гц","Максимальная воспроизводимая частота":"28000 Гц","Сопротивление (импеданс)":"32Ω","Микрофон":"есть","Съемный микрофон":"нет","Длина кабеля":"2м","Разъем для подключения к устройству":"jack 3.5 mm - 2 x jack 3.5 mm","Вес":"272г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-400305545432/main/bc5735bd-158f-46e3-9f17-44eb4527dd5c.webp	\N	\N	\N	\N	0	6	2026-04-29 15:56:57.624	2026-04-29 16:40:09.373	400305545432
59	ACC-665617384952	Проводные наушники Logitech G PRO X	16090	\N	{"Тип конструкции":"охватывающие","Материал амбушюр":"мягкая пена, экокожа","Складные":"нет","Подсветка":"нет","Формат звуковой схемы":"7.1 Virtual","Минимальная воспроизводимая частота":"20 Гц","Максимальная воспроизводимая частота":"20000 Гц","Сопротивление (импеданс)":"35Ω","Микрофон":"есть","Съемный микрофон":"есть","Длина кабеля":"2м","Разъем для подключения к устройству":"jack 3.5 mm - 2 x jack 3.5 mm","Вес":"320г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-665617384952/main/988b5de4-7e89-4661-aaf2-c42b60afb75d.webp	\N	\N	\N	\N	0	6	2026-04-29 15:56:57.631	2026-04-29 16:40:09.378	665617384952
60	ACC-781150403652	Проводные наушники Logitech G PRO X SE	12190	\N	{"Тип конструкции":"охватывающие","Материал амбушюр":"мягкая пена, экокожа","Складные":"нет","Подсветка":"нет","Формат звуковой схемы":"7.1","Минимальная воспроизводимая частота":"20 Гц","Максимальная воспроизводимая частота":"20000 Гц","Сопротивление (импеданс)":"32Ω","Микрофон":"есть","Съемный микрофон":"есть","Длина кабеля":"2м","Разъем для подключения к устройству":"jack 3.5 mm - 2 x jack 3.5 mm","Вес":"320г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-781150403652/main/9d4e7feb-8813-4d66-9039-bafceeef7a25.webp	\N	\N	\N	\N	0	6	2026-04-29 15:56:57.637	2026-04-29 16:40:09.383	781150403652
61	ACC-941385341792	Проводные наушники Logitech G431	9520	\N	{"Тип конструкции":"охватывающие","Материал амбушюр":"экокожа","Складные":"нет","Подсветка":"нет","Формат звуковой схемы":"7.1 Virtual","Минимальная воспроизводимая частота":"20 Гц","Максимальная воспроизводимая частота":"20000 Гц","Сопротивление (импеданс)":"39Ω","Микрофон":"есть","Съемный микрофон":"нет","Длина кабеля":"1.3м","Разъем для подключения к устройству":"jack 3.5 mm - 2 x jack 3.5 mm, переходник jack 3.5 mm - USB Type-A","Вес":"280г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-941385341792/main/5251653d-1e1d-42f0-8d86-5749e649a207.webp	\N	\N	\N	\N	0	6	2026-04-29 15:56:57.644	2026-04-29 16:40:09.388	941385341792
62	ACC-261336763712	Проводные наушники Razer BlackShark V2 X	5730	\N	{"Тип конструкции":"охватывающие","Материал амбушюр":"мягкая пена, экокожа","Складные":"нет","Подсветка":"нет","Формат звуковой схемы":"7.1 Virtual","Минимальная воспроизводимая частота":"12 Гц","Максимальная воспроизводимая частота":"28000 Гц","Сопротивление (импеданс)":"32Ω","Микрофон":"есть","Съемный микрофон":"нет","Длина кабеля":"1.3м","Разъем для подключения к устройству":"jack 3.5 mm - 2 x jack 3.5 mm","Вес":"240г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-261336763712/main/2ab0fc14-cdf7-4b1f-9c50-52ef78dfb8da.webp	\N	\N	\N	\N	0	6	2026-04-29 15:56:57.651	2026-04-29 16:40:09.394	261336763712
56	ACC-815772831282	Проводные наушники HyperX Cloud Alpha HX	10360	\N	{"Тип конструкции":"охватывающие","Материал амбушюр":"экокожа","Складные":"нет","Подсветка":"нет","Формат звуковой схемы":"2.0","Минимальная воспроизводимая частота":"13 Гц","Максимальная воспроизводимая частота":"27000 Гц","Сопротивление (импеданс)":"65Ω","Микрофон":"есть","Съемный микрофон":"есть","Длина кабеля":"1.3м","Разъем для подключения к устройству":"jack 3.5 mm - 2 x jack 3.5 mm, переходник jack 3.5 mm - USB Type-A","Вес":"298г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-815772831282/main/b93a9638-fac4-4ee1-b95d-f7f50a71dd7d.webp	\N	\N	\N	\N	0	6	2026-04-29 15:56:57.611	2026-04-29 16:40:09.362	815772831282
65	ACC-634812982332	Проводные наушники Redragon Aurora WHITE	3790	\N	{"Тип конструкции":"охватывающие","Материал амбушюр":"кожзам, мягкая пена","Складные":"нет","Подсветка":"нет","Формат звуковой схемы":"7.1 Virtual","Минимальная воспроизводимая частота":"20 Гц","Максимальная воспроизводимая частота":"20000 Гц","Сопротивление (импеданс)":"32Ω","Микрофон":"есть","Съемный микрофон":"нет","Длина кабеля":"1.8м","Разъем для подключения к устройству":"USB Type-A","Вес":"300г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-634812982332/main/4938adc0-9f32-4244-86b5-909cd6b8beca.webp	\N	\N	\N	\N	0	6	2026-04-29 15:56:57.671	2026-04-29 16:40:09.409	634812982332
66	ACC-131920946862	Maono PD200XS	7590	\N	{"Принцип действия":"динамический","Тип микрофона":"компьютерный","Направленность":"кардиоидный","Тип подключения":"проводное","Интерфейс проводного подключения":"USB Type-A, USB Type-C, XLR","Пантограф":"есть","Ветрозащита":"есть","Поп-фильтр":"нет","Разъемы":"USB Type-C, XLR, jack 3.5 мм","Чувствительность":"-52 дБ","Минимальная частота":"40 Гц","Максимальная частота":"16000 Гц","Максимальный уровень звукового давления":"130 дБ","Частота дискретизации":"24 бит/48 кГц"}	https://tg-shop.hb.bizmrg.com/accessories/acc-131920946862/main/cbec37a2-f551-4300-aea4-3808d2d7f1a0.webp	\N	\N	\N	\N	0	7	2026-04-29 15:56:57.678	2026-04-29 16:40:09.413	131920946862
67	ACC-874538753502	Maono PD200XS WHITE	7590	\N	{"Принцип действия":"динамический","Тип микрофона":"компьютерный","Направленность":"кардиоидный","Тип подключения":"проводное","Интерфейс проводного подключения":"USB Type-A, USB Type-C, XLR","Пантограф":"есть","Ветрозащита":"есть","Поп-фильтр":"нет","Разъемы":"USB Type-C, XLR, jack 3.5 мм","Чувствительность":"-52 дБ","Минимальная частота":"40 Гц","Максимальная частота":"16000 Гц","Максимальный уровень звукового давления":"130 дБ","Частота дискретизации":"24 бит/48 кГц"}	https://tg-shop.hb.bizmrg.com/accessories/acc-874538753502/main/bf6a0ca5-c8da-45a1-af7e-f23c2bf81b48.webp	\N	\N	\N	\N	0	7	2026-04-29 15:56:57.685	2026-04-29 16:40:09.418	874538753502
68	ACC-334845250832	Микрофон Fifine A8	6290	\N	{"Принцип действия":"конденсаторный","Тип микрофона":"компьютерный","Направленность":"кардиоидный","Тип подключения":"проводное","Интерфейс проводного подключения":"USB Type-A","Пантограф":"нет","Ветрозащита":"нет","Поп-фильтр":"есть","Разъемы":"USB Type-C, jack 3.5 мм","Чувствительность":"-40 дБ","Минимальная частота":"50 Гц","Максимальная частота":"20000 Гц"}	https://tg-shop.hb.bizmrg.com/accessories/acc-334845250832/main/b692f20c-1491-4b5b-a1cf-093df8ae2f57.webp	\N	\N	\N	\N	0	7	2026-04-29 15:56:57.692	2026-04-29 16:40:09.424	334845250832
69	ACC-685999291042	Микрофон Fifine A8 WHITE	6290	\N	{"Принцип действия":"конденсаторный","Тип микрофона":"компьютерный","Направленность":"кардиоидный","Тип подключения":"проводное","Интерфейс проводного подключения":"USB Type-A","Пантограф":"нет","Ветрозащита":"нет","Поп-фильтр":"есть","Разъемы":"USB Type-C, jack 3.5 мм","Чувствительность":"-40 дБ","Минимальная частота":"50 Гц","Максимальная частота":"20000 Гц"}	https://tg-shop.hb.bizmrg.com/accessories/acc-685999291042/main/2bf72233-eea6-428e-9ffe-0237e2c453df.webp	\N	\N	\N	\N	0	7	2026-04-29 15:56:57.698	2026-04-29 16:40:09.43	685999291042
70	ACC-511311600752	Микрофон Fifine K688	5390	\N	{"Принцип действия":"динамический","Тип микрофона":"компьютерный, студийный","Направленность":"кардиоидный","Тип подключения":"проводное","Интерфейс проводного подключения":"USB Type-A, XLR","Пантограф":"нет","Ветрозащита":"нет","Поп-фильтр":"нет","Разъемы":"USB Type-C, XLR, jack 3.5 мм","Чувствительность":"-58 дБ","Минимальная частота":"70 Гц","Максимальная частота":"15000 Гц","Максимальный уровень звукового давления":"130 дБ","Частота дискретизации":"16 бит/48 кГц"}	https://tg-shop.hb.bizmrg.com/accessories/acc-511311600752/main/1ef642eb-0f7b-40f3-9421-e1bf8cae6dcd.webp	\N	\N	\N	\N	0	7	2026-04-29 15:56:57.705	2026-04-29 16:40:09.435	511311600752
64	ACC-910863738482	Проводные наушники Redragon Aurora	3490	\N	{"Тип конструкции":"охватывающие","Материал амбушюр":"кожзам, мягкая пена","Складные":"нет","Подсветка":"нет","Формат звуковой схемы":"7.1 Virtual","Минимальная воспроизводимая частота":"20 Гц","Максимальная воспроизводимая частота":"20000 Гц","Сопротивление (импеданс)":"32Ω","Микрофон":"есть","Съемный микрофон":"нет","Длина кабеля":"1.8м","Разъем для подключения к устройству":"USB Type-A","Вес":"300г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-910863738482/main/9e7cad17-2a0d-4199-af89-8cdfc514c7be.webp	\N	\N	\N	\N	0	6	2026-04-29 15:56:57.664	2026-04-29 16:40:09.404	910863738482
73	ACC-685568355342	Микрофон Logitech Yeti Orb	9290	\N	{"Принцип действия":"конденсаторный","Тип микрофона":"компьютерный","Направленность":"кардиоидный","Тип подключения":"проводное","Интерфейс проводного подключения":"USB Type-A","Пантограф":"нет","Ветрозащита":"нет","Поп-фильтр":"нет","Разъемы":"USB Type-C","Чувствительность":"-36 дБ","Минимальная частота":"70 Гц","Максимальная частота":"20000 Гц","Максимальный уровень звукового давления":"117 дБ"}	https://tg-shop.hb.bizmrg.com/accessories/acc-685568355342/main/f9c1d501-bdb2-4aff-b5e2-842ee38cedef.webp	\N	\N	\N	\N	0	7	2026-04-29 15:56:57.725	2026-04-29 16:40:09.449	685568355342
74	ACC-979129064422	Микрофон RODE NT-USB+	34190	\N	{"Принцип действия":"конденсаторный","Тип микрофона":"компьютерный","Направленность":"кардиоидный","Тип подключения":"проводное","Интерфейс проводного подключения":"USB Type-C","Пантограф":"нет","Ветрозащита":"нет","Поп-фильтр":"есть","Разъемы":"USB Type-C, jack 3.5 мм","Минимальная частота":"20 Гц","Максимальная частота":"20000 Гц","Частота дискретизации":"24 бит/48 кГц","Максимальный уровень звукового давления":"118 дБ"}	https://tg-shop.hb.bizmrg.com/accessories/acc-979129064422/main/9c98dadb-7951-4bf9-b8cc-36ba58201feb.webp	\N	\N	\N	\N	0	7	2026-04-29 15:56:57.731	2026-04-29 16:40:09.455	979129064422
75	ACC-737009391962	Микрофон Razer Seiren V3 Mini	8690	\N	{"Принцип действия":"конденсаторный","Тип микрофона":"компьютерный","Направленность":"суперкардиоидный","Тип подключения":"проводное","Интерфейс проводного подключения":"USB Type-A","Пантограф":"нет","Ветрозащита":"нет","Поп-фильтр":"нет","Разъемы":"USB Type-C","Чувствительность":"-36 дБ","Минимальная частота":"20 Гц","Максимальная частота":"20000 Гц","Максимальный уровень звукового давления":"110 дБ","Частота дискретизации":"24 бит/96 кГц"}	https://tg-shop.hb.bizmrg.com/accessories/acc-737009391962/main/a4af7a9f-f0b2-4100-8712-d4eb83fe3035.webp	\N	\N	\N	\N	0	7	2026-04-29 15:56:57.738	2026-04-29 16:40:09.461	737009391962
76	ACC-839804274132	Микрофон Razer Seiren V3 Mini WHITE	8690	\N	{"Принцип действия":"конденсаторный","Тип микрофона":"компьютерный","Направленность":"суперкардиоидный","Тип подключения":"проводное","Интерфейс проводного подключения":"USB Type-A","Пантограф":"нет","Ветрозащита":"нет","Поп-фильтр":"нет","Разъемы":"USB Type-C","Чувствительность":"-36 дБ","Минимальная частота":"20 Гц","Максимальная частота":"20000 Гц","Максимальный уровень звукового давления":"110 дБ","Частота дискретизации":"24 бит/96 кГц"}	https://tg-shop.hb.bizmrg.com/accessories/acc-839804274132/main/b5b24d23-92c8-41ff-a338-9e0aeeb7c58a.webp	\N	\N	\N	\N	0	7	2026-04-29 15:56:57.744	2026-04-29 16:40:09.466	839804274132
77	ACC-211988771052	26.5" Монитор LG UltraGear 27G OLED 480ГЦ	129990	\N	{"Диагональ экрана (дюйм)":"26.5","Разрешение экрана":"2560x1440","Тип матрицы":"OLED","Яркость":"275 Кд/м²","Частота обновления экрана":"480ГЦ","Время отклика пикселя":"0.03мс","Технология динамического обновления экрана":"8bit+FRC","Видео разъемы":"HDMI/DISPLAY PORT","Регулировка наклона":"есть","Регулировка по высоте":"есть","Размер VESA":"100x100","Комплект":"блок питания, документация, кабель DisplayPort - DisplayPort"}	https://tg-shop.hb.bizmrg.com/accessories/acc-26_5_монитор_lg/main/3913119a-eef2-4fb6-983b-57718beedd04.webp	\N	\N	\N	\N	0	8	2026-04-29 15:56:57.75	2026-04-29 16:40:09.471	211988771052
78	ACC-814364225862	27" Монитор ASUS ROG Strix XG27 280ГЦ Изогнутый	58990	\N	{"Диагональ экрана (дюйм)":"27","Разрешение экрана":"2560x1440","Тип матрицы":"VA","Яркость":"400 Кд/м²","Частота обновления экрана":"280ГЦ","Время отклика пикселя":"1мс","Технология динамического обновления экрана":"8bit+FRC","Видео разъемы":"HDMI/DISPLAY PORT","Регулировка наклона":"есть","Регулировка по высоте":"есть","Размер VESA":"100x100","Комплект":"документация, кабель DisplayPort - DisplayPort, кабель питания, стикер"}	https://tg-shop.hb.bizmrg.com/accessories/acc-814364225862/main/0feb32fb-9aa2-4214-a009-586b9112e294.webp	\N	\N	\N	\N	0	8	2026-04-29 15:56:57.757	2026-04-29 16:40:09.476	814364225862
72	ACC-402515880892	Микрофон HyperX QuadCast 2	19890	\N	{"Принцип действия":"конденсаторный","Тип микрофона":"компьютерный","Направленность":"всенаправленный, двунаправленный, кардиоидный","Тип подключения":"проводное","Интерфейс проводного подключения":"USB Type-A, USB Type-C","Пантограф":"нет","Ветрозащита":"нет","Поп-фильтр":"нет","Разъемы":"USB Type-C, jack 3.5 мм","Чувствительность":"-7.5 дБ","Минимальная частота":"20 Гц","Максимальная частота":"20000 Гц","Частота дискретизации":"24 бит/96 кГц"}	https://tg-shop.hb.bizmrg.com/accessories/acc-402515880892/main/5e19ea97-315f-48ae-8332-0881c9018ebb.webp	\N	\N	\N	\N	0	7	2026-04-29 15:56:57.718	2026-04-29 16:40:09.445	402515880892
81	ACC-722057649492	27" Монитор MSI MAG 27 180ГЦ	30990	\N	{"Диагональ экрана (дюйм)":"27(изогнутый)","Разрешение экрана":"2560x1440","Тип матрицы":"VA","Яркость":"300 Кд/м²","Частота обновления экрана":"180ГЦ","Время отклика пикселя":"0.5мс","Технология динамического обновления экрана":"8bit+FRC","Видео разъемы":"HDMI/DISPLAY PORT","Регулировка наклона":"есть","Регулировка по высоте":"нет","Размер VESA":"100x100","Комплект":"блок питания, документация, кабель DisplayPort - DisplayPort"}	https://tg-shop.hb.bizmrg.com/accessories/acc-722057649492/main/0b301e28-4387-4275-98a5-f1c193b24387.webp	\N	\N	\N	\N	0	8	2026-04-29 15:56:57.777	2026-04-29 16:40:09.492	722057649492
82	ACC-543089682842	27" Монитор MSI MAG 27 240ГЦ	31990	\N	{"Диагональ экрана (дюйм)":"27","Разрешение экрана":"2560x1440","Тип матрицы":"IPS","Яркость":"300 Кд/м²","Частота обновления экрана":"180ГЦ","Время отклика пикселя":"0.5мс","Технология динамического обновления экрана":"8bit+FRC","Видео разъемы":"HDMI/DISPLAY PORT","Регулировка наклона":"есть","Регулировка по высоте":"нет","Размер VESA":"100x100","Комплект":"блок питания, документация, кабель DisplayPort - DisplayPort"}	https://tg-shop.hb.bizmrg.com/accessories/acc-543089682842/main/7d5e6010-5aca-43d4-8076-51e7f426f8cd.webp	\N	\N	\N	\N	0	8	2026-04-29 15:56:57.784	2026-04-29 16:40:09.497	543089682842
83	ACC-496558782032	27" Монитор Redmi G27 240ГЦ	27990	\N	{"Диагональ экрана (дюйм)":"27","Разрешение экрана":"2560x1440","Тип матрицы":"IPS","Яркость":"400 Кд/м²","Частота обновления экрана":"240ГЦ","Время отклика пикселя":"1мс","Технология динамического обновления экрана":"8bit","Видео разъемы":"HDMI/DISPLAY PORT","Регулировка наклона":"есть","Регулировка по высоте":"есть","Размер VESA":"75x75","Комплект":"блок питания, документация, кабель DisplayPort - DisplayPort"}	https://tg-shop.hb.bizmrg.com/accessories/acc-496558782032/main/cb7f5464-159a-40dc-9136-150dc0e2c0ec.webp	\N	\N	\N	\N	0	8	2026-04-29 15:56:57.79	2026-04-29 16:40:09.502	496558782032
84	ACC-414274328402	27" Монитор Samsung Odyssey OLED G6 360ГЦ	97990	\N	{"Диагональ экрана (дюйм)":"27","Разрешение экрана":"2560x1440","Тип матрицы":"OLED","Яркость":"250 Кд/м²","Частота обновления экрана":"360ГЦ","Время отклика пикселя":"0.03мс","Технология динамического обновления экрана":"8bit+FRC","Видео разъемы":"HDMI/DISPLAY PORT","Регулировка наклона":"есть","Регулировка по высоте":"есть","Размер VESA":"100x100","Комплект":"блок питания, кабель DisplayPort - DisplayPort, кабель HDMI - HDMI"}	https://tg-shop.hb.bizmrg.com/accessories/acc-414274328402/main/a38f0bc5-0985-42d1-b2bd-5a241166cff6.webp	\N	\N	\N	\N	0	8	2026-04-29 15:56:57.798	2026-04-29 16:40:09.506	414274328402
85	ACC-648650612302	27" Монитор Xiaomi G27 180ГЦ	19990	\N	{"Диагональ экрана (дюйм)":"27","Разрешение экрана":"2560x1440","Тип матрицы":"IPS","Яркость":"300 Кд/м²","Частота обновления экрана":"180ГЦ","Время отклика пикселя":"1мс","Технология динамического обновления экрана":"8bit","Видео разъемы":"HDMI/DISPLAY PORT","Регулировка наклона":"есть","Регулировка по высоте":"нет","Размер VESA":"100x100","Комплект":"блок питания, документация, кабель DisplayPort - DisplayPort"}	https://tg-shop.hb.bizmrg.com/accessories/acc-648650612302/main/7871a6c1-e279-4d7c-9ab9-6bba10542364.webp	\N	\N	\N	\N	0	8	2026-04-29 15:56:57.804	2026-04-29 16:40:09.512	648650612302
86	ACC-772918749972	27" Монитор LG 27G 240ГЦ	112990	\N	{"Диагональ экрана (дюйм)":"27","Разрешение экрана":"3840x2160","Тип матрицы":"IPS","Яркость":"450 Кд/м²","Частота обновления экрана":"240ГЦ","Время отклика пикселя":"1мс","Технология динамического обновления экрана":"10bit","Видео разъемы":"HDMI/DISPLAY PORT","Регулировка наклона":"есть","Регулировка по высоте":"есть","Размер VESA":"100x100","Комплект":"кабель DisplayPort - DisplayPort, кабель HDMI - HDMI, кабель USB Type-A - Type-B"}	https://tg-shop.hb.bizmrg.com/accessories/acc-772918749972/main/d89c4cf9-8327-4cd9-9ef6-6f216eb52732.webp	\N	\N	\N	\N	0	8	2026-04-29 15:56:57.811	2026-04-29 16:40:09.517	772918749972
80	ACC-978756919632	27" Монитор MSI G27 180ГЦ	34990	\N	{"Диагональ экрана (дюйм)":"27","Разрешение экрана":"2560x1440","Тип матрицы":"IPS","Яркость":"300 Кд/м²","Частота обновления экрана":"180ГЦ","Время отклика пикселя":"1мс","Технология динамического обновления экрана":"8bit+FRC","Видео разъемы":"HDMI/DISPLAY PORT","Регулировка наклона":"есть","Регулировка по высоте":"есть","Размер VESA":"100x100","Комплект":"блок питания, документация, кабель DisplayPort - DisplayPort"}	https://tg-shop.hb.bizmrg.com/accessories/acc-978756919632/main/c760c5e7-ad22-4c1b-b04d-0a39f48d1c6d.webp	\N	\N	\N	\N	0	8	2026-04-29 15:56:57.771	2026-04-29 16:40:09.486	978756919632
89	ACC-746849084072	31.5" Монитор ASUS PG32 240ГЦ OLED	235990	\N	{"Диагональ экрана (дюйм)":"31.5","Разрешение экрана":"3840x2160","Тип матрицы":"OLED","Яркость":"1000 Кд/м²","Частота обновления экрана":"240ГЦ","Время отклика пикселя":"0.03мс","Технология динамического обновления экрана":"10bit","Видео разъемы":"HDMI/DISPLAY PORT","Регулировка наклона":"есть","Регулировка по высоте":"есть","Размер VESA":"100x100","Комплект":"блок питания, документация, кабель DisplayPort - DisplayPort, кабель HDMI - HDMI, кабель USB, стикеры"}	https://tg-shop.hb.bizmrg.com/accessories/acc-746849084072/main/7bcab18c-e553-4bc5-a846-22dd7c2842a8.webp	\N	\N	\N	\N	0	8	2026-04-29 15:56:57.83	2026-04-29 16:40:09.532	746849084072
90	ACC-940561387722	31.5" Монитор LG UltraGear 32 240ГЦ OLED	195990	\N	{"Диагональ экрана (дюйм)":"31.5","Разрешение экрана":"3840x2160","Тип матрицы":"OLED","Яркость":"1300 Кд/м²","Частота обновления экрана":"240ГЦ","Время отклика пикселя":"0.03мс","Технология динамического обновления экрана":"10bit","Видео разъемы":"HDMI/DISPLAY PORT","Регулировка наклона":"есть","Регулировка по высоте":"есть","Размер VESA":"100x100","Комплект":"блок питания, документация, кабель DisplayPort - DisplayPort, кабель HDMI - HDMI, кабель USB Type-A - Type-B"}	https://tg-shop.hb.bizmrg.com/accessories/acc-940561387722/main/b5eeea13-b3d4-416f-8eb0-4d3e5ecd4952.webp	\N	\N	\N	\N	0	8	2026-04-29 15:56:57.837	2026-04-29 16:40:09.539	940561387722
91	ACC-634590217062	31.5" Монитор MSI MAG 322 160ГЦ	76990	\N	{"Диагональ экрана (дюйм)":"31.5","Разрешение экрана":"3840x2160","Тип матрицы":"IPS","Яркость":"450 Кд/м²","Частота обновления экрана":"160ГЦ","Время отклика пикселя":"0.5мс","Технология динамического обновления экрана":"8bit+FRC","Видео разъемы":"HDMI/DISPLAY PORT","Регулировка наклона":"есть","Регулировка по высоте":"есть","Размер VESA":"100x100","Комплект":"документация, кабель DisplayPort - DisplayPort, кабель USB Type-A - Type-B, кабель питания"}	https://tg-shop.hb.bizmrg.com/accessories/acc-634590217062/main/34574678-e814-4aff-bfb2-3147e300538a.webp	\N	\N	\N	\N	0	8	2026-04-29 15:56:57.843	2026-04-29 16:40:09.545	634590217062
92	ACC-627209913982	34" Монитор ASUS ROG Swift PG34 240ГЦ OLED	212990	\N	{"Диагональ экрана (дюйм)":"34(изогнутый)","Разрешение экрана":"3840x2160","Тип матрицы":"OLED","Яркость":"1300 Кд/м²","Частота обновления экрана":"240ГЦ","Время отклика пикселя":"0.03мс","Технология динамического обновления экрана":"10bit","Видео разъемы":"HDMI/DISPLAY PORT","Регулировка наклона":"есть","Регулировка по высоте":"есть","Размер VESA":"100x100","Комплект":"блок питания, документация, кабель DisplayPort - DisplayPort, кабель HDMI - HDMI, кабель USB, кабель USB Type-C - USB Type-C, кабель питания, крепежные винты, стикеры, чехол"}	https://tg-shop.hb.bizmrg.com/accessories/acc-627209913982/main/eafa564e-c158-4344-b005-4ad3a7bf74cd.webp	\N	\N	\N	\N	0	8	2026-04-29 15:56:57.851	2026-04-29 16:40:09.553	627209913982
93	ACC-305564104732	34" Монитор Xiaomi Curved Gaming Monitor G34 180ГЦ	40990	\N	{"Диагональ экрана (дюйм)":"34(изогнутый)","Разрешение экрана":"3840x2160","Тип матрицы":"VA","Яркость":"350 Кд/м²","Частота обновления экрана":"180ГЦ","Время отклика пикселя":"1мс","Технология динамического обновления экрана":"8bit","Видео разъемы":"HDMI/DISPLAY PORT","Регулировка наклона":"есть","Регулировка по высоте":"есть","Размер VESA":"75x75","Комплект":"блок питания, документация, кабель DisplayPort - DisplayPort"}	https://tg-shop.hb.bizmrg.com/accessories/acc-305564104732/main/65509d50-9fef-4c6e-8493-96f9a57a5eed.webp	\N	\N	\N	\N	0	8	2026-04-29 15:56:57.858	2026-04-29 16:40:09.559	305564104732
94	ACC-245941132092	23.8" Монитор Acer KG24 200ГЦ	14990	\N	{"Диагональ экрана (дюйм)":"23.8","Разрешение экрана":"1920x1080","Тип матрицы":"IPS","Яркость":"250Кд/м²","Частота обновления экрана":"200ГЦ","Время отклика пикселя":"1мс","Технология динамического обновления экрана":"6Bit+FRC","Видео разъемы":"HDMI/DISPLAY PORT","Регулировка наклона":"есть","Регулировка по высоте":"нет","Размер VESA":"100x100","Комплект":"блок питания, документация, кабель HDMI - HDMI"}	https://tg-shop.hb.bizmrg.com/accessories/acc-245941132092/main/d3b8a1de-e4f6-45a3-af59-a29f8db6dc4e.webp	\N	\N	\N	\N	0	8	2026-04-29 15:56:57.864	2026-04-29 16:40:09.566	245941132092
88	ACC-413329748772	27" Монитор Samsung Odyssey OLED G8 240ГЦ	134990	\N	{"Диагональ экрана (дюйм)":"27","Разрешение экрана":"3840x2160","Тип матрицы":"OLED","Яркость":"260 Кд/м²","Частота обновления экрана":"240ГЦ","Время отклика пикселя":"1мс","Технология динамического обновления экрана":"10bit","Видео разъемы":"HDMI/DISPLAY PORT","Регулировка наклона":"есть","Регулировка по высоте":"есть","Размер VESA":"100x100","Комплект":"кабель DisplayPort - DisplayPort, кабель HDMI - HDMI, кабель USB Type-A - Type-B"}	https://tg-shop.hb.bizmrg.com/accessories/acc-413329748772/main/a5644f5b-bbdf-404a-af5b-f01426bfd802.webp	\N	\N	\N	\N	0	8	2026-04-29 15:56:57.824	2026-04-29 16:40:09.527	413329748772
98	ACC-249434924932	24.5" Монитор MSI MAG 25 300ГЦ	22990	\N	{"Диагональ экрана (дюйм)":"24.5","Разрешение экрана":"1920x1080","Тип матрицы":"IPS","Яркость":"250Кд/м²","Частота обновления экрана":"300ГЦ","Время отклика пикселя":"0.5мс","Технология динамического обновления экрана":"8bit+FRC","Видео разъемы":"HDMI/DISPLAY PORT","Регулировка наклона":"есть","Регулировка по высоте":"нет","Размер VESA":"100x100","Комплект":"блок питания, документация, кабель HDMI - HDMI"}	https://tg-shop.hb.bizmrg.com/accessories/acc-249434924932/main/27987851-ddff-48ea-bf8d-e2318859578e.webp	\N	\N	\N	\N	0	8	2026-04-29 15:56:57.891	2026-04-29 16:40:09.598	249434924932
99	ACC-450837387522	25" Монитор Samsung Odyssey G4 240ГЦ	28990	\N	{"Диагональ экрана (дюйм)":"25","Разрешение экрана":"1920x1080","Тип матрицы":"IPS","Яркость":"400 Кд/м²","Частота обновления экрана":"240ГЦ","Время отклика пикселя":"1мс","Технология динамического обновления экрана":"8bit","Видео разъемы":"HDMI/DISPLAY PORT","Регулировка наклона":"есть","Регулировка по высоте":"есть","Размер VESA":"100x100","Комплект":"блок питания, документация, кабель HDMI - HDMI"}	https://tg-shop.hb.bizmrg.com/accessories/acc-450837387522/main/8aa7e46b-6de2-4cf7-92d9-9e38d5b048bd.webp	\N	\N	\N	\N	0	8	2026-04-29 15:56:57.897	2026-04-29 16:40:09.605	450837387522
100	ACC-642896412442	БЕЛЫЙ L	850	\N	{"Длина":"450 мм","Ширина":"350 мм","Толщина":"3 мм","Вес":"240 г","Материал покрытия":"ткань","Материал основания":"резина","Основной цвет":"белый"}	https://tg-shop.hb.bizmrg.com/accessories/acc-642896412442/main/7a0e2054-46ee-49e1-b818-49ff20c60c28.webp	\N	\N	\N	\N	0	9	2026-04-29 15:56:57.904	2026-04-29 16:40:09.612	642896412442
102	ACC-760732866262	БЕЛЫЙ XXL	3500	\N	{"Длина":"1200 мм","Ширина":"600 мм","Толщина":"4 мм","Вес":"1800 г","Материал покрытия":"ткань","Материал основания":"резина","Основной цвет":"белый"}	https://tg-shop.hb.bizmrg.com/accessories/acc-760732866262/main/bc501ceb-de88-43e2-a2a3-e136f0524dbd.webp	\N	\N	\N	\N	0	9	2026-04-29 15:56:57.917	2026-04-29 16:40:09.625	760732866262
103	ACC-358427073312	ЧЕРНЫЙ L	700	\N	{"Длина":"450 мм","Ширина":"350 мм","Толщина":"3 мм","Вес":"240 г","Материал покрытия":"ткань","Материал основания":"резина","Основной цвет":"черный"}	https://tg-shop.hb.bizmrg.com/accessories/acc-358427073312/main/aba94444-f4be-4ca2-af8c-7310784b2292.png	\N	\N	\N	\N	0	9	2026-04-29 15:56:57.923	2026-04-29 16:40:09.631	358427073312
104	ACC-449402037792	ЧЕРНЫЙ XL	1750	\N	{"Длина":"900 мм","Ширина":"400 мм","Толщина":"4 мм","Вес":"820 г","Материал покрытия":"ткань","Материал основания":"резина","Основной цвет":"черный"}	https://tg-shop.hb.bizmrg.com/accessories/acc-449402037792/main/4b82b22a-5f94-4391-946f-d05f54a8f684.webp	\N	\N	\N	\N	0	9	2026-04-29 15:56:57.93	2026-04-29 16:40:09.638	449402037792
105	ACC-121321208812	ЧЕРНЫЙ XXL	3100	\N	{"Длина":"1200 мм","Ширина":"600 мм","Толщина":"4 мм","Вес":"1800 г","Материал покрытия":"ткань","Материал основания":"резина","Основной цвет":"черный"}	https://tg-shop.hb.bizmrg.com/accessories/acc-121321208812/main/f4531559-3857-47da-8c3b-90abb51d7eac.png	\N	\N	\N	\N	0	9	2026-04-29 15:56:57.937	2026-04-29 16:40:09.645	121321208812
1	PC-PRIME-1	PRIME 1	83990	\N	{"Процессор":"INTEL CORE I5-12400F","Видеокарта":"NVIDIA RTX 4060 8GB","Память":"DDR4 16GB 8GBX2 RGB","Накопитель":"SSD M.2 500GB","Материнская плата":"H610M DDR4","Охлаждение":"Башенный кулер 180TDP","Блок питания":"600W 80+BRONZE","Корпус":"1STPLAYER GO 2"}	https://tg-shop.hb.bizmrg.com/products/pc-prime-1/main/2f0bc073-ba09-4fa5-a933-f1a5bffa527d.jpg	https://tg-shop.hb.bizmrg.com/products/pc-prime-1/fps/9282a07a-66bb-4d51-b2bd-487f6d7d4995.png	["https://tg-shop.hb.bizmrg.com/products/pc-prime-1/gallery/0a508d32-4fb7-4266-9e21-d2b279bfc716.jpg","https://tg-shop.hb.bizmrg.com/products/pc-prime-1/gallery/a8247bac-a66f-4e63-8582-3a711bff304a.jpg","https://tg-shop.hb.bizmrg.com/products/pc-prime-1/gallery/b3bd47be-213e-4111-84f3-f279cd8c5e2c.jpg","https://tg-shop.hb.bizmrg.com/products/pc-prime-1/gallery/c7664ab6-dc03-4ca3-972b-0139b60731b6.jpg"]	https://kinescope.io/29ATj2yjF45RfNyJstQcm7	https://www.youtube.com/watch?v=1wgh54vD5hM&ab_channel=PCSupport%26GamingTest	1	1	2026-04-29 15:18:36.785	2026-04-29 16:16:50.587	522681308372
97	ACC-945067272922	24.5" Монитор MSI G25 180ГЦ	21990	\N	{"Диагональ экрана (дюйм)":"24.5","Разрешение экрана":"1920x1080","Тип матрицы":"IPS","Яркость":"300Кд/м²","Частота обновления экрана":"180ГЦ","Время отклика пикселя":"1мс","Технология динамического обновления экрана":"8bit","Видео разъемы":"HDMI/DISPLAY PORT","Регулировка наклона":"есть","Регулировка по высоте":"есть","Размер VESA":"100x100","Комплект":"блок питания, документация, кабель HDMI - HDMI"}	https://tg-shop.hb.bizmrg.com/accessories/acc-945067272922/main/00b6cced-21f2-45d9-af18-436ee53309cd.webp	\N	\N	\N	\N	0	8	2026-04-29 15:56:57.884	2026-04-29 16:40:09.593	945067272922
101	ACC-292339943922	БЕЛЫЙ XL	2100	\N	{"Длина":"900 мм","Ширина":"400 мм","Толщина":"4 мм","Вес":"820 г","Материал покрытия":"ткань","Материал основания":"резина","Основной цвет":"белый"}	https://tg-shop.hb.bizmrg.com/accessories/acc-292339943922/main/e1e00047-89f5-4382-b222-ebf792a70ed3.webp	\N	\N	\N	\N	0	9	2026-04-29 15:56:57.91	2026-04-29 16:40:09.618	292339943922
11	PC-PULSAR-3	PULSAR 3	367990	\N	{"Процессор":"AMD RYZEN 7 9800X3D","Видеокарта":"NVIDIA RTX 5080 16GB","Память":"DDR5 32GB 16GBX2 RGB","Накопитель":"SSD M.2 1000GB","Материнская плата":"X870 WIFI DDR5","Охлаждение":"Водяное охлаждение 360ММ","Блок питания":"1000W 80+GOLD","Корпус":"LIAN LI O11 DYNAMIC"}	https://tg-shop.hb.bizmrg.com/products/pc-pulsar-3/main/83b7c6ad-e9b1-4ced-be7d-6d13908b93f3.jpg	https://tg-shop.hb.bizmrg.com/products/pc-pulsar-3/fps/4ea30ff7-543f-4707-897a-a2352a459734.png	["https://tg-shop.hb.bizmrg.com/products/pc-pulsar-3/gallery/80478152-3067-41a0-a4a1-1a6b1ed1ae56.jpg","https://tg-shop.hb.bizmrg.com/products/pc-pulsar-3/gallery/bb53a3d3-1f00-4de0-8cf4-90ca16d1316a.jpg","https://tg-shop.hb.bizmrg.com/products/pc-pulsar-3/gallery/311152bb-770e-4255-b04b-d24a1f9e8733.jpg","https://tg-shop.hb.bizmrg.com/products/pc-pulsar-3/gallery/9b869931-ae29-486c-80d2-bef649103212.jpg"]	https://kinescope.io/fAUBa5Uy3rMqxinv9dj2og	https://www.youtube.com/watch?v=gz0YWVjonX4&t=1197s&ab_channel=EJSComputers	0	3	2026-04-29 15:18:36.865	2026-04-29 16:16:50.674	883151958182
12	PC-PULSAR-4	PULSAR 4	631990	\N	{"Процессор":"AMD RYZEN 9 9950X3D","Видеокарта":"NVIDIA RTX 5090 32GB","Память":"DDR5 64GB 32GBX2 RGB","Накопитель":"SSD M.2 1000GB","Материнская плата":"X870E WIFI DDR5","Охлаждение":"Водяное охлаждение 360ММ","Блок питания":"1000W 80+PLATINUM","Корпус":"LIAN LI O11 DYNAMIC"}	https://tg-shop.hb.bizmrg.com/products/pc-pulsar-4/main/f2062ed9-e07c-4070-b414-49df9795f513.jpg	https://tg-shop.hb.bizmrg.com/products/pc-pulsar-4/fps/0764445b-0fbb-4c46-8065-60270cff612f.png	["https://tg-shop.hb.bizmrg.com/products/pc-pulsar-4/gallery/24533183-c2c9-4d48-b23c-82d6502f9dfa.jpg","https://tg-shop.hb.bizmrg.com/products/pc-pulsar-4/gallery/575cd4ff-bd7e-4311-bc69-505869782ac3.jpg","https://tg-shop.hb.bizmrg.com/products/pc-pulsar-4/gallery/b7aae8a9-b3b9-4cb9-a640-f60ea69e01ae.jpg","https://tg-shop.hb.bizmrg.com/products/pc-pulsar-4/gallery/631b623d-8a73-4f17-9594-6d48f6824ada.jpg"]	https://kinescope.io/bUhDVSjhGznc2uK921JTn7	https://www.youtube.com/watch?v=DCeQ52egVok&ab_channel=BENCHMARKSFORGAMERS	0	3	2026-04-29 15:18:36.871	2026-04-29 16:16:50.68	455633169132
14	ACC-288461846002	Клавиатура беспроводная ASUS X901 Strix Scope II 96 BLACK	21290	\N	{"Подсветка клавиш клавиатуры":"RGB","Тип клавиатуры":"механическая","Основной цвет":"черный","Язык раскладки":"русский, английский","Подсветка клавиш":"RGB","Цифровой блок":"есть","Тип переключателей":"ROG NX Snow","Общее количество клавиш":"98","Материал корпуса":"пластик","Интерфейс подключения":"Bluetooth, USB Type-A, радиоканал"}	https://tg-shop.hb.bizmrg.com/accessories/acc-288461846002/main/750c1ffa-f086-4646-a5db-fb699e7969cc.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-288461846002/gallery/f9f60e6b-0d96-4641-9133-f95a3ad95889.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-288461846002/gallery/929181be-eb74-4a33-a212-98ff8d594bdb.webp"]	\N	\N	0	4	2026-04-29 15:56:57.415	2026-04-29 16:40:09.112	288461846002
22	ACC-260839849442	Клавиатура проводная MSI Vigor GK20	3290	\N	{"Тип клавиатуры":"мембранная","Основной цвет":"черный","Язык раскладки":"русский, английский","Подсветка клавиш":"RGB","Цифровой блок":"есть","Общее количество клавиш":"104","Материал корпуса":"пластик","Интерфейс подключения":"USB Type-A","Длина кабеля":"1.5м"}	https://tg-shop.hb.bizmrg.com/accessories/acc-260839849442/main/041b34ea-1fea-4d59-a919-7ea5b04eaa58.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-260839849442/gallery/82a5cb3b-a33e-4921-bbf7-ea2405e8fe68.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-260839849442/gallery/4a29b044-a274-43f0-a66f-e8a40fc3e88f.webp"]	\N	\N	0	4	2026-04-29 15:56:57.447	2026-04-29 16:40:09.16	260839849442
31	ACC-528486215522	Мышь беспроводная/проводная AJAZZ AJ159 NL	3090	\N	{"Разрешение датчика":"12000 dpi","Общее количество кнопок":"6","Подсветка":"RGB","Основной цвет":"черный","Модель сенсора":"PixArt PAW3311","Хват":"для правой руки","Частота опроса":"1000 Гц","Интерфейс подключения":"Bluetooth, радиоканал, USB Type-A, USB Type-C","Длина кабеля":"1.5м","Вес":"61г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-528486215522/main/da4bd43b-aaef-401d-a473-5681d7d4bbd2.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-528486215522/gallery/11a83f4c-a09b-4f1d-b8fd-0c9913369f2b.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-528486215522/gallery/7a1f39b8-95e2-4f14-bf2e-d440ed78face.webp"]	\N	\N	0	5	2026-04-29 15:56:57.48	2026-04-29 16:40:09.232	528486215522
36	ACC-194526238172	Мышь беспроводная/проводная Ajazz AJ139 V2 MC WHITE	2790	\N	{"Разрешение датчика":"3200 dpi","Общее количество кнопок":"6","Подсветка":"RGB","Основной цвет":"белый","Модель сенсора":"PixArt PAW3311","Хват":"для правой и левой руки","Частота опроса":"125 Гц, 1000 Гц","Режимы работы датчика":"400 dpi, 3200 dpi","Интерфейс подключения":"Bluetooth, радиоканал, USB Type-A","Длина кабеля":"1.5м","Вес":"66г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-194526238172/main/d20237e8-8408-4ae1-b948-024581e5ec77.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-194526238172/gallery/a3b2b608-2e56-4629-9376-207b6340dbb5.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-194526238172/gallery/103289fa-3369-4978-9dd5-410f94314a72.webp"]	\N	\N	0	5	2026-04-29 15:56:57.496	2026-04-29 16:40:09.256	194526238172
47	ACC-675662563722	Беспроводные наушники Logitech G733	18190	\N	{"Тип конструкции":"охватывающие","Материал амбушюр":"мягкая пена, ткань","Складные":"нет","Подсветка":"разноцветная","Формат звуковой схемы":"7.1 Virtual","Минимальная воспроизводимая частота":"20 Гц","Максимальная воспроизводимая частота":"20000 Гц","Сопротивление (импеданс)":"39Ω","Микрофон":"есть","Съемный микрофон":"есть","Разъем для подключения к устройству":"радиоканал, провод","Вес":"278г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-675662563722/main/7d15446a-f8bc-4ad1-87f9-82940c8ae679.webp	\N	\N	\N	\N	0	6	2026-04-29 15:56:57.551	2026-04-29 16:40:09.315	675662563722
55	ACC-617705158592	Беспроводные/проводные наушники Redragon Zeus Pro черный	6290	\N	{"Тип конструкции":"охватывающие","Материал амбушюр":"мягкая пена, ткань","Складные":"нет","Подсветка":"разноцветная","Формат звуковой схемы":"7.1 Virtual","Минимальная воспроизводимая частота":"20 Гц","Максимальная воспроизводимая частота":"20000 Гц","Сопротивление (импеданс)":"64Ω","Микрофон":"есть","Съемный микрофон":"есть","Длина кабеля":"2м","Разъем для подключения к устройству":"jack 3.5 mm - 2 x jack 3.5 mm","Вес":"280г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-617705158592/main/996ec226-5ca6-47a8-bde2-2c37842d59c0.webp	\N	\N	\N	\N	0	6	2026-04-29 15:56:57.606	2026-04-29 16:40:09.357	617705158592
63	ACC-765104265362	Проводные наушники Razer BlackShark V2 X WHITE	6580	\N	{"Тип конструкции":"охватывающие","Материал амбушюр":"мягкая пена, экокожа","Складные":"нет","Подсветка":"нет","Формат звуковой схемы":"7.1 Virtual","Минимальная воспроизводимая частота":"12 Гц","Максимальная воспроизводимая частота":"28000 Гц","Сопротивление (импеданс)":"32Ω","Микрофон":"есть","Съемный микрофон":"нет","Длина кабеля":"1.3м","Разъем для подключения к устройству":"jack 3.5 mm - 2 x jack 3.5 mm","Вес":"240г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-765104265362/main/950a1ea4-24a6-4497-8e6d-46cfa8af59d2.webp	\N	\N	\N	\N	0	6	2026-04-29 15:56:57.657	2026-04-29 16:40:09.399	765104265362
71	ACC-537987695472	Микрофон Fifine K688 WHITE	5390	\N	{"Принцип действия":"динамический","Тип микрофона":"компьютерный, студийный","Направленность":"кардиоидный","Тип подключения":"проводное","Интерфейс проводного подключения":"USB Type-A, XLR","Пантограф":"нет","Ветрозащита":"нет","Поп-фильтр":"нет","Разъемы":"USB Type-C, XLR, jack 3.5 мм","Чувствительность":"-58 дБ","Минимальная частота":"70 Гц","Максимальная частота":"15000 Гц","Максимальный уровень звукового давления":"130 дБ","Частота дискретизации":"16 бит/48 кГц"}	https://tg-shop.hb.bizmrg.com/accessories/acc-537987695472/main/281c2375-f14a-44b8-9784-52ba29a4790a.webp	\N	\N	\N	\N	0	7	2026-04-29 15:56:57.712	2026-04-29 16:40:09.44	537987695472
79	ACC-474550661512	27" Монитор MAG 27 300ГЦ	32990	\N	{"Диагональ экрана (дюйм)":"27","Разрешение экрана":"2560x1440","Тип матрицы":"IPS","Яркость":"400 Кд/м²","Частота обновления экрана":"300ГЦ","Время отклика пикселя":"1мс","Технология динамического обновления экрана":"8bit+FRC","Видео разъемы":"HDMI/DISPLAY PORT","Регулировка наклона":"есть","Регулировка по высоте":"нет","Размер VESA":"100x100","Комплект":"блок питания, документация, кабель DisplayPort - DisplayPort"}	https://tg-shop.hb.bizmrg.com/accessories/acc-474550661512/main/1ef29563-5d00-45fc-8c9a-676ca6ed1877.webp	\N	\N	\N	\N	0	8	2026-04-29 15:56:57.764	2026-04-29 16:40:09.481	474550661512
87	ACC-338586990842	27" Монитор MSI MAG 27 160ГЦ	53990	\N	{"Диагональ экрана (дюйм)":"27","Разрешение экрана":"3840x2160","Тип матрицы":"IPS","Яркость":"450 Кд/м²","Частота обновления экрана":"160ГЦ","Время отклика пикселя":"0.5мс","Технология динамического обновления экрана":"8bit+FRC","Видео разъемы":"HDMI/DISPLAY PORT","Регулировка наклона":"есть","Регулировка по высоте":"есть","Размер VESA":"100x100","Комплект":"документация, кабель DisplayPort - DisplayPort, кабель USB Type-A - Type-B, кабель питания"}	https://tg-shop.hb.bizmrg.com/accessories/acc-338586990842/main/e6335f32-9884-426e-9ef5-20743efd2035.webp	\N	\N	\N	\N	0	8	2026-04-29 15:56:57.818	2026-04-29 16:40:09.522	338586990842
96	ACC-866015457522	24.5" Монитор ASUS ROG Strix XG25 380ГЦ	51990	\N	{"Диагональ экрана (дюйм)":"24.5","Разрешение экрана":"1920x1080","Тип матрицы":"IPS","Яркость":"400Кд/м²","Частота обновления экрана":"380ГЦ","Время отклика пикселя":"1мс","Технология динамического обновления экрана":"8bit","Видео разъемы":"HDMI/DISPLAY PORT","Регулировка наклона":"есть","Регулировка по высоте":"есть","Размер VESA":"100x100","Комплект":"блок питания, документация, кабель DisplayPort - DisplayPort"}	https://tg-shop.hb.bizmrg.com/accessories/acc-866015457522/main/7a8ccc66-f068-405d-add2-a70ce4936083.webp	\N	\N	\N	\N	0	8	2026-04-29 15:56:57.877	2026-04-29 16:40:09.587	866015457522
5	PC-PHANTOM-1	PHANTOM 1	159990	\N	{"Процессор":"INTEL CORE I5-13400F","Видеокарта":"NVIDIA RTX 5070 12GB","Память":"DDR5 32GB 16GBX2 RGB","Накопитель":"SSD M.2 1000GB","Материнская плата":"B760M DDR5","Охлаждение":"Башенный кулер 180TDP","Блок питания":"750W 80+GOLD","Корпус":"JONSBO D31"}	https://tg-shop.hb.bizmrg.com/products/pc-phantom-1/main/c351cb74-c62b-4583-98a6-4a131c2d3706.jpg	https://tg-shop.hb.bizmrg.com/products/pc-phantom-1/fps/441a7651-450e-4433-a693-aa488a1dff0c.png	["https://tg-shop.hb.bizmrg.com/products/pc-phantom-1/gallery/765b315d-940c-4cca-8879-c05fe79bb408.jpg","https://tg-shop.hb.bizmrg.com/products/pc-phantom-1/gallery/9d8c537e-0385-4e05-b7dd-2d28346cb498.jpg","https://tg-shop.hb.bizmrg.com/products/pc-phantom-1/gallery/2b454515-7260-46f7-9d42-e06c8036f267.jpg","https://tg-shop.hb.bizmrg.com/products/pc-phantom-1/gallery/75f572ad-c7c1-4b8d-85aa-4dbfc5076155.jpg"]	https://kinescope.io/9zxUeFV4QYjEEBEbJXouBB	https://www.youtube.com/watch?v=jWjb4Sf0IvA&ab_channel=ShadowSeven	3	2	2026-04-29 15:18:36.824	2026-04-29 16:16:50.629	751456801642
39	ACC-962894687092	Мышь проводная Logitech G102 LIGHTSYNC WHITE	2890	\N	{"Разрешение датчика":"8000 dpi","Общее количество кнопок":"6","Подсветка":"RGB","Основной цвет":"белый","Модель сенсора":"Mercury","Хват":"для правой и левой руки","Частота опроса":"1000 Гц","Режимы работы датчика":"200 dpi, 8000 dpi","Интерфейс подключения":"USB Type-A","Длина кабеля":"2.1м","Вес":"85г"}	https://tg-shop.hb.bizmrg.com/accessories/acc-962894687092/main/1c22373b-d331-4dd6-881f-bbe813980ba7.webp	\N	["https://tg-shop.hb.bizmrg.com/accessories/acc-962894687092/gallery/ddf9c481-5b8f-4930-b67c-618430fe721d.webp","https://tg-shop.hb.bizmrg.com/accessories/acc-962894687092/gallery/cb3733c0-66cf-4440-ba3f-faaee416fda5.webp"]	\N	\N	0	5	2026-04-29 15:56:57.507	2026-04-29 16:40:09.274	962894687092
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (key, value, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admins_id_seq', 2, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 21, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 105, true);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: bot_users bot_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bot_users
    ADD CONSTRAINT bot_users_pkey PRIMARY KEY ("telegramId");


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (key);


--
-- Name: admins_telegramId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "admins_telegramId_key" ON public.admins USING btree ("telegramId");


--
-- Name: categories_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);


--
-- Name: products_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "products_productId_key" ON public.products USING btree ("productId");


--
-- Name: products products_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict kY8j4qORUJ88dTRvPfbWB9ryQTEB7J9UqQfcGJrtQewj9gh7ip1kwhCSwAUYVu6

