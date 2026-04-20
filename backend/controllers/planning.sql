--
-- PostgreSQL database dump
--

\restrict MBbZOdgxOsAt4MDE3UelZccNp1wmVeke0qNJOK3AM4kqiP6clxC0y71hcigg9Ue

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-04-20 10:40:23

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- TOC entry 226 (class 1259 OID 221193)
-- Name: bill_of_materials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bill_of_materials (
    id integer NOT NULL,
    product_item character varying(50) CONSTRAINT bill_of_materials_item_code_not_null NOT NULL,
    product_name text,
    quantity numeric(15,4) NOT NULL,
    component_code character varying(50) NOT NULL,
    component_description text,
    component_quantity numeric NOT NULL,
    warehouse_fg character varying(20),
    qtypcs_item integer,
    status_bom character varying(20),
    linenum integer,
    component_whs character varying(20),
    uom_component character varying(10),
    ratio_component numeric(15,6),
    CONSTRAINT bill_of_materials_quantity_check CHECK ((quantity > (0)::numeric)),
    CONSTRAINT chk_qty_component CHECK ((component_quantity > (0)::numeric)),
    CONSTRAINT chk_qty_item CHECK ((quantity > (0)::numeric))
);


ALTER TABLE public.bill_of_materials OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 221192)
-- Name: bill_of_materials_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bill_of_materials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bill_of_materials_id_seq OWNER TO postgres;

--
-- TOC entry 5176 (class 0 OID 0)
-- Dependencies: 225
-- Name: bill_of_materials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bill_of_materials_id_seq OWNED BY public.bill_of_materials.id;


--
-- TOC entry 228 (class 1259 OID 278540)
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    customer_code character varying(30),
    customer_name text NOT NULL
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 278539)
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO postgres;

--
-- TOC entry 5177 (class 0 OID 0)
-- Dependencies: 227
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- TOC entry 246 (class 1259 OID 344375)
-- Name: demand_item_assembly; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.demand_item_assembly (
    id integer NOT NULL,
    demand_id integer,
    demand_item_id integer,
    item_id integer,
    item_code character varying(50),
    description text,
    uom character varying(20),
    total_qty numeric(10,2),
    pcs numeric(10,2),
    production_schedule jsonb,
    warehouse character varying(50) DEFAULT 'WIPA'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.demand_item_assembly OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 344374)
-- Name: demand_item_assembly_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.demand_item_assembly_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.demand_item_assembly_id_seq OWNER TO postgres;

--
-- TOC entry 5178 (class 0 OID 0)
-- Dependencies: 245
-- Name: demand_item_assembly_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.demand_item_assembly_id_seq OWNED BY public.demand_item_assembly.id;


--
-- TOC entry 244 (class 1259 OID 344286)
-- Name: demand_item_finishing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.demand_item_finishing (
    id integer NOT NULL,
    demand_id integer,
    demand_item_id integer,
    item_id integer,
    item_code character varying(50),
    description text,
    uom character varying(20),
    total_qty numeric(10,2),
    pcs numeric(10,2),
    production_schedule jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.demand_item_finishing OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 344285)
-- Name: demand_item_finishing_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.demand_item_finishing_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.demand_item_finishing_id_seq OWNER TO postgres;

--
-- TOC entry 5179 (class 0 OID 0)
-- Dependencies: 243
-- Name: demand_item_finishing_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.demand_item_finishing_id_seq OWNED BY public.demand_item_finishing.id;


--
-- TOC entry 242 (class 1259 OID 294933)
-- Name: demand_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.demand_items (
    id integer NOT NULL,
    demand_id integer,
    item_id integer,
    item_code character varying(50),
    total_qty numeric(10,2),
    production_schedule jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    description text,
    uom character varying(20),
    pcs numeric(10,2)
);


ALTER TABLE public.demand_items OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 294932)
-- Name: demand_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.demand_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.demand_items_id_seq OWNER TO postgres;

--
-- TOC entry 5180 (class 0 OID 0)
-- Dependencies: 241
-- Name: demand_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.demand_items_id_seq OWNED BY public.demand_items.id;


--
-- TOC entry 240 (class 1259 OID 294924)
-- Name: demands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.demands (
    id integer NOT NULL,
    so_number character varying(50),
    so_date date,
    customer_name character varying(255),
    delivery_date date,
    production_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    has_schedule boolean DEFAULT false NOT NULL,
    is_generated boolean DEFAULT false,
    is_assembly_generated boolean DEFAULT false,
    is_finishing_generated boolean DEFAULT false
);


ALTER TABLE public.demands OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 294923)
-- Name: demands_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.demands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.demands_id_seq OWNER TO postgres;

--
-- TOC entry 5181 (class 0 OID 0)
-- Dependencies: 239
-- Name: demands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.demands_id_seq OWNED BY public.demands.id;


--
-- TOC entry 224 (class 1259 OID 114712)
-- Name: grpo_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grpo_reports (
    id integer NOT NULL,
    tgl_grpo date,
    tahun integer,
    bulan character varying(20),
    entry_grpo character varying(50),
    no_grpo character varying(50),
    no_inv_sim character varying(50),
    no_tally character varying(50),
    no_ref_po character varying(50),
    no_kedatangan character varying(50),
    no_surat_jalan_vendor character varying(50),
    kode_vendor character varying(30),
    nama_vendor character varying(100),
    rank integer,
    group_rotary character varying(50),
    kode_item character varying(50),
    description text,
    qty_pcs_grpo integer,
    qty_grpo numeric(18,3),
    price_per_m3 numeric(18,2),
    total_price_grpo numeric(18,2),
    whs character varying(30),
    status_grpo character varying(30),
    kota_asal character varying(100),
    asal_barang character varying(100),
    slpcode character varying(30),
    nama_grader character varying(100),
    diameter numeric(10,2),
    jenis_kayu character varying(50),
    group_kayu character varying(50),
    total_dia numeric(10,2),
    code character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.grpo_reports OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 114711)
-- Name: grpo_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.grpo_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.grpo_reports_id_seq OWNER TO postgres;

--
-- TOC entry 5182 (class 0 OID 0)
-- Dependencies: 223
-- Name: grpo_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.grpo_reports_id_seq OWNED BY public.grpo_reports.id;


--
-- TOC entry 250 (class 1259 OID 344465)
-- Name: item_assembly_core; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item_assembly_core (
    id integer NOT NULL,
    assembly_code character varying(50) NOT NULL,
    description text,
    warehouse character varying(50),
    cycle_time_seconds integer DEFAULT 0,
    capacity_per_shift integer DEFAULT 0,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cycle_time integer DEFAULT 0,
    CONSTRAINT check_positive_values CHECK (((cycle_time_seconds >= 0) AND (capacity_per_shift >= 0)))
);


ALTER TABLE public.item_assembly_core OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 344464)
-- Name: item_assembly_core_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.item_assembly_core_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.item_assembly_core_id_seq OWNER TO postgres;

--
-- TOC entry 5183 (class 0 OID 0)
-- Dependencies: 249
-- Name: item_assembly_core_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.item_assembly_core_id_seq OWNED BY public.item_assembly_core.id;


--
-- TOC entry 248 (class 1259 OID 344398)
-- Name: item_assembly_pannel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item_assembly_pannel (
    id integer NOT NULL,
    assembly_code character varying(50) NOT NULL,
    description text,
    warehouse character varying(50) DEFAULT 'PFIN'::character varying,
    cycle_time integer DEFAULT 0,
    capacity_per_shift integer DEFAULT 0,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.item_assembly_pannel OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 344397)
-- Name: item_assembly_pannel_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.item_assembly_pannel_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.item_assembly_pannel_id_seq OWNER TO postgres;

--
-- TOC entry 5184 (class 0 OID 0)
-- Dependencies: 247
-- Name: item_assembly_pannel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.item_assembly_pannel_id_seq OWNED BY public.item_assembly_pannel.id;


--
-- TOC entry 252 (class 1259 OID 344477)
-- Name: item_finishing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item_finishing (
    id integer NOT NULL,
    finishing_code character varying(50) NOT NULL,
    description text,
    warehouse character varying(50),
    item_code character varying(50),
    cycle_time integer DEFAULT 0,
    capacity_per_shift integer DEFAULT 0
);


ALTER TABLE public.item_finishing OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 344476)
-- Name: item_finishing_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.item_finishing_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.item_finishing_id_seq OWNER TO postgres;

--
-- TOC entry 5185 (class 0 OID 0)
-- Dependencies: 251
-- Name: item_finishing_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.item_finishing_id_seq OWNED BY public.item_finishing.id;


--
-- TOC entry 254 (class 1259 OID 344490)
-- Name: item_routings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item_routings (
    id integer NOT NULL,
    item_code character varying(50),
    finishing_code character varying(50),
    assembly_code_pannel character varying(50),
    assembly_code_core character varying(50)
);


ALTER TABLE public.item_routings OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 344489)
-- Name: item_routings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.item_routings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.item_routings_id_seq OWNER TO postgres;

--
-- TOC entry 5186 (class 0 OID 0)
-- Dependencies: 253
-- Name: item_routings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.item_routings_id_seq OWNED BY public.item_routings.id;


--
-- TOC entry 230 (class 1259 OID 278553)
-- Name: items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items (
    id integer NOT NULL,
    item_code character varying(50) NOT NULL,
    description text,
    uom character varying(10),
    warehouse character varying(10),
    cycle_time integer,
    capacity_per_shift integer
);


ALTER TABLE public.items OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 278552)
-- Name: items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.items_id_seq OWNER TO postgres;

--
-- TOC entry 5187 (class 0 OID 0)
-- Dependencies: 229
-- Name: items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.items_id_seq OWNED BY public.items.id;


--
-- TOC entry 236 (class 1259 OID 278631)
-- Name: machines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.machines (
    id integer NOT NULL,
    machine_code character varying(30),
    machine_name text,
    department text
);


ALTER TABLE public.machines OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 278630)
-- Name: machines_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.machines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.machines_id_seq OWNER TO postgres;

--
-- TOC entry 5188 (class 0 OID 0)
-- Dependencies: 235
-- Name: machines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.machines_id_seq OWNED BY public.machines.id;


--
-- TOC entry 238 (class 1259 OID 278643)
-- Name: operations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.operations (
    id integer NOT NULL,
    operation_name text,
    department text
);


ALTER TABLE public.operations OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 278642)
-- Name: operations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.operations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.operations_id_seq OWNER TO postgres;

--
-- TOC entry 5189 (class 0 OID 0)
-- Dependencies: 237
-- Name: operations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.operations_id_seq OWNED BY public.operations.id;


--
-- TOC entry 222 (class 1259 OID 57359)
-- Name: production_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.production_reports (
    id integer NOT NULL,
    production_no character varying(50),
    status_po character varying(20),
    sales_order_no character varying(50),
    buyer_code character varying(50),
    buyer_name character varying(100),
    status_so character varying(20),
    so_cancel boolean,
    checkin_no character varying(50),
    checkout_no character varying(50),
    doc_date date,
    bulan character varying(20),
    shift character varying(10),
    operator_name character varying(100),
    koordinator character varying(100),
    no_proses character varying(50),
    workcenter character varying(50),
    workcenter2 character varying(50),
    route character varying(50),
    mesin character varying(50),
    unit_mesin character varying(50),
    kategori character varying(50),
    item_code character varying(50),
    item_description text,
    vol_per_pcs numeric(10,2),
    input_pcs integer,
    input_volume numeric(12,2),
    output_pcs integer,
    output_volume numeric(12,2),
    valid_qty_pcs integer,
    valid_qty numeric(12,2),
    reject_pcs integer,
    reject_volume numeric(12,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status_check_out character varying(20),
    line_id character varying(50),
    updated_at timestamp without time zone
);


ALTER TABLE public.production_reports OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 57358)
-- Name: production_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.production_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.production_reports_id_seq OWNER TO postgres;

--
-- TOC entry 5190 (class 0 OID 0)
-- Dependencies: 221
-- Name: production_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.production_reports_id_seq OWNED BY public.production_reports.id;


--
-- TOC entry 256 (class 1259 OID 417961)
-- Name: public_holidays; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.public_holidays (
    id integer NOT NULL,
    holiday_date date NOT NULL,
    description character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.public_holidays OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 417960)
-- Name: public_holidays_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.public_holidays ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.public_holidays_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 234 (class 1259 OID 278585)
-- Name: sales_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_order_items (
    id integer NOT NULL,
    sales_order_id integer,
    item_id integer,
    quantity numeric(14,2),
    pcs integer
);


ALTER TABLE public.sales_order_items OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 278584)
-- Name: sales_order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sales_order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_order_items_id_seq OWNER TO postgres;

--
-- TOC entry 5191 (class 0 OID 0)
-- Dependencies: 233
-- Name: sales_order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sales_order_items_id_seq OWNED BY public.sales_order_items.id;


--
-- TOC entry 232 (class 1259 OID 278567)
-- Name: sales_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_orders (
    id integer NOT NULL,
    so_number character varying(50) NOT NULL,
    so_date date NOT NULL,
    customer_id integer,
    delivery_date date,
    status character varying(20) DEFAULT 'OPEN'::character varying
);


ALTER TABLE public.sales_orders OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 278566)
-- Name: sales_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sales_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_orders_id_seq OWNER TO postgres;

--
-- TOC entry 5192 (class 0 OID 0)
-- Dependencies: 231
-- Name: sales_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sales_orders_id_seq OWNED BY public.sales_orders.id;


--
-- TOC entry 220 (class 1259 OID 49165)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    email character varying(100),
    nama_lengkap character varying(100) NOT NULL,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    role character varying(50)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 49164)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- TOC entry 5193 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 258 (class 1259 OID 417980)
-- Name: work_centers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_centers (
    id integer NOT NULL,
    work_center_name character varying(100) NOT NULL,
    line_name character varying(50),
    lead_time integer DEFAULT 1,
    ewh integer DEFAULT 20160,
    yield numeric(5,2) DEFAULT 100.00,
    description text,
    updated_at timestamp without time zone DEFAULT now(),
    total_lines integer DEFAULT 1,
    percentage numeric(5,2),
    ewh_final numeric(10,2)
);


ALTER TABLE public.work_centers OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 417979)
-- Name: work_centers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.work_centers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_centers_id_seq OWNER TO postgres;

--
-- TOC entry 5194 (class 0 OID 0)
-- Dependencies: 257
-- Name: work_centers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.work_centers_id_seq OWNED BY public.work_centers.id;


--
-- TOC entry 4857 (class 2604 OID 221196)
-- Name: bill_of_materials id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_of_materials ALTER COLUMN id SET DEFAULT nextval('public.bill_of_materials_id_seq'::regclass);


--
-- TOC entry 4858 (class 2604 OID 278543)
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- TOC entry 4875 (class 2604 OID 344378)
-- Name: demand_item_assembly id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demand_item_assembly ALTER COLUMN id SET DEFAULT nextval('public.demand_item_assembly_id_seq'::regclass);


--
-- TOC entry 4873 (class 2604 OID 344289)
-- Name: demand_item_finishing id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demand_item_finishing ALTER COLUMN id SET DEFAULT nextval('public.demand_item_finishing_id_seq'::regclass);


--
-- TOC entry 4871 (class 2604 OID 294936)
-- Name: demand_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demand_items ALTER COLUMN id SET DEFAULT nextval('public.demand_items_id_seq'::regclass);


--
-- TOC entry 4865 (class 2604 OID 294927)
-- Name: demands id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demands ALTER COLUMN id SET DEFAULT nextval('public.demands_id_seq'::regclass);


--
-- TOC entry 4855 (class 2604 OID 114715)
-- Name: grpo_reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grpo_reports ALTER COLUMN id SET DEFAULT nextval('public.grpo_reports_id_seq'::regclass);


--
-- TOC entry 4883 (class 2604 OID 344468)
-- Name: item_assembly_core id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_assembly_core ALTER COLUMN id SET DEFAULT nextval('public.item_assembly_core_id_seq'::regclass);


--
-- TOC entry 4878 (class 2604 OID 344401)
-- Name: item_assembly_pannel id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_assembly_pannel ALTER COLUMN id SET DEFAULT nextval('public.item_assembly_pannel_id_seq'::regclass);


--
-- TOC entry 4888 (class 2604 OID 344480)
-- Name: item_finishing id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_finishing ALTER COLUMN id SET DEFAULT nextval('public.item_finishing_id_seq'::regclass);


--
-- TOC entry 4891 (class 2604 OID 344493)
-- Name: item_routings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_routings ALTER COLUMN id SET DEFAULT nextval('public.item_routings_id_seq'::regclass);


--
-- TOC entry 4859 (class 2604 OID 278556)
-- Name: items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items ALTER COLUMN id SET DEFAULT nextval('public.items_id_seq'::regclass);


--
-- TOC entry 4863 (class 2604 OID 278634)
-- Name: machines id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.machines ALTER COLUMN id SET DEFAULT nextval('public.machines_id_seq'::regclass);


--
-- TOC entry 4864 (class 2604 OID 278646)
-- Name: operations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operations ALTER COLUMN id SET DEFAULT nextval('public.operations_id_seq'::regclass);


--
-- TOC entry 4853 (class 2604 OID 57362)
-- Name: production_reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_reports ALTER COLUMN id SET DEFAULT nextval('public.production_reports_id_seq'::regclass);


--
-- TOC entry 4862 (class 2604 OID 278588)
-- Name: sales_order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_order_items ALTER COLUMN id SET DEFAULT nextval('public.sales_order_items_id_seq'::regclass);


--
-- TOC entry 4860 (class 2604 OID 278570)
-- Name: sales_orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_orders ALTER COLUMN id SET DEFAULT nextval('public.sales_orders_id_seq'::regclass);


--
-- TOC entry 4850 (class 2604 OID 49168)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 4893 (class 2604 OID 417983)
-- Name: work_centers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_centers ALTER COLUMN id SET DEFAULT nextval('public.work_centers_id_seq'::regclass);


--
-- TOC entry 5138 (class 0 OID 221193)
-- Dependencies: 226
-- Data for Name: bill_of_materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bill_of_materials (id, product_item, product_name, quantity, component_code, component_description, component_quantity, warehouse_fg, qtypcs_item, status_bom, linenum, component_whs, uom_component, ratio_component) FROM stdin;
1	FGB00001	BARECORE LAYER MRE 20x1220x2440	5.9536	RMB00002	ALBASIA FALCATA BARECORE A 10.5x1220x2440	6.2512	PFIN	100	Active	0	GKOP	m3	0.952400
2	FGB00001	BARECORE LAYER MRE 20x1220x2440	5.9536	SUP00073	PREMIX UL MRE-1	110	PFIN	100	Active	1	GKOP	Kg	0.054100
3	FGB00007	ALBASIA FALCATA BARECORE LAYER MRE 20x1220x2440	5.9536	FGB00026	FG BARECORE LAYER MRE 20x1220x2440	5.9536	GPAK	100	Active	0	FGOD	m3	1.000000
4	FGB00007	ALBASIA FALCATA BARECORE LAYER MRE 20x1220x2440	5.9536	PAK00080	PACKING TUMPUK 42	100	GPAK	100	Active	1	GKPP	Set	0.059500
5	FGB00008	ALBASIA FALCATA BARECORE LAYER MRE 25x1220x2440	7.4420	FGB00025	FG BARECORE LAYER MRE 25x1220x2440	7.442	GPAK	100	Active	0	FGOD	m3	1.000000
6	FGB00008	ALBASIA FALCATA BARECORE LAYER MRE 25x1220x2440	7.4420	PAK00081	PACKING TUMPUK 34 LOKAL	100	GPAK	100	Active	1	GKPP	Set	0.074400
7	FGB00009	ALBASIA FALCATA BARECORE LAYER MRE 32x1220x1950	7.6128	FGB00003	BARECORE LAYER MRE 32x1220x1950	7.6128	GPAK	100	Active	0	FGOD	m3	1.000000
8	FGB00009	ALBASIA FALCATA BARECORE LAYER MRE 32x1220x1950	7.6128	PAK00081	PACKING TUMPUK 34 LOKAL	100	GPAK	100	Active	1	GKPP	Set	0.076100
9	FGB00010	ALBASIA FALCATA BARECORE LAYER MRE 33x800x2300	6.0720	FGB00004	BARECORE LAYER MRE 33x800x2300	6.072	GPAK	100	Active	0	FGOD	m3	1.000000
10	FGB00010	ALBASIA FALCATA BARECORE LAYER MRE 33x800x2300	6.0720	PAK00081	PACKING TUMPUK 34 LOKAL	100	GPAK	100	Active	1	GKPP	Set	0.060700
11	FGB00011	ALBASIA FALCATA BARECORE LAYER MRE 34x1220x2440	10.1211	FGB00030	FG BARECORE LAYER MRE 34x1220x2440	10.1211	GPAK	100	Active	0	FGOD	m3	1.000000
12	FGB00011	ALBASIA FALCATA BARECORE LAYER MRE 34x1220x2440	10.1211	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.101200
13	FGB00012	ALBASIA FALCATA BARECORE LAYER MRE 36x1220x1980	8.6962	FGB00006	BARECORE LAYER MRE 36x1220x1980	8.6962	GPAK	100	Active	0	FGOD	m3	1.000000
14	FGB00012	ALBASIA FALCATA BARECORE LAYER MRE 36x1220x1980	8.6962	PAK00083	PACKING TUMPUK 31	100	GPAK	100	Active	1	GKPP	Set	0.087000
15	FGB00016	ALBASIA FALCATA BARECORE LAYER MRE 33x780x2300	5.9202	FGB00034	FG BARECORE LAYER MRE 33x780x2300	5.9202	GPAK	100	Active	0	FGOD	m3	1.000000
16	FGB00016	ALBASIA FALCATA BARECORE LAYER MRE 33x780x2300	5.9202	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.059200
17	FGB00017	ALBASIA FALCATA BARECORE LAYER MRE 33x870x2300	6.6033	FGB00021	BARECORE LAYER MRE 33x870x2300	6.6033	GPAK	100	Active	0	FGOD	m3	1.000000
18	FGB00017	ALBASIA FALCATA BARECORE LAYER MRE 33x870x2300	6.6033	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.066000
19	FGB00018	ALBASIA FALCATA BARECORE LAYER MRE 32x912x1950	5.6909	FGB00028	FG BARECORE LAYER MRE 32x912x1950	5.6909	GPAK	100	Active	0	FGOD	m3	1.000000
20	FGB00018	ALBASIA FALCATA BARECORE LAYER MRE 32x912x1950	5.6909	PAK00081	PACKING TUMPUK 34 LOKAL	100	GPAK	100	Active	1	GKPP	Set	0.056900
21	FGB00019	BARECORE LAYER MRE 32x912x1950	5.6909	RMB00066	ALBASIA FALCATA BARECORE B 10.5x912x1950	3.7346	PFIN	100	Active	0	GKOP	m3	1.523800
22	FGB00019	BARECORE LAYER MRE 32x912x1950	5.6909	RMB00073	ALBASIA FALCATA BARECORE A 13 CENTER CORE	2.31192	PFIN	100	Active	1	GKOP	m3	2.461500
23	FGB00019	BARECORE LAYER MRE 32x912x1950	5.6909	SUP00073	PREMIX UL MRE-1	102.5	PFIN	100	Active	2	GKOP	Kg	0.055500
24	FGB00023	BARECORE LAYER 32x912x2355	6.8728	RMB00071	ALBASIA FALCATA BARECORE 10.5x912x2355	4.5102	PFIN	100	Active	0	GKOP	m3	1.523800
25	FGB00023	BARECORE LAYER 32x912x2355	6.8728	RMB00009	ALBASIA FALCATA BARECORE 13x1220x2440	2.7089	PFIN	100	Active	1	GKOP	m3	2.537100
26	FGB00023	BARECORE LAYER 32x912x2355	6.8728	SUP00073	PREMIX UL MRE-1	102.5	PFIN	100	Active	2	GKOP	Kg	0.067100
27	FGB00024	ALBASIA FALCATA BARECORE LAYER MRE 32x912x2355	6.8728	FGB00031	FG BARECORE LAYER MRE 32x912x2355	6.8728	GPAK	100	Active	0	FGOD	m3	1.000000
28	FGB00024	ALBASIA FALCATA BARECORE LAYER MRE 32x912x2355	6.8728	PAK00081	PACKING TUMPUK 34 LOKAL	100	GPAK	100	Active	1	GKPP	Set	0.068700
29	FGB00025	FG BARECORE LAYER MRE 25x1220x2440	7.4420	RMB00009	ALBASIA FALCATA BARECORE A 13x1220x2440	7.7396	FGOD	100	Active	0	GKOP	m3	0.961500
30	FGB00025	FG BARECORE LAYER MRE 25x1220x2440	7.4420	SUP00073	PREMIX UL MRE-1	117.1504	FGOD	100	Active	1	GKOP	Kg	0.063500
31	FGB00026	FG BARECORE LAYER MRE 20x1220x2440	5.9536	FGB00001	BARECORE LAYER MRE 20x1220x2440	5.9536	FGOD	100	Active	0	PFIN	m3	1.000000
32	FGB00028	FG BARECORE LAYER MRE 32x912x1950	5.6909	FGB00019	BARECORE LAYER MRE 32x912x1950	5.6909	FGOD	100	Active	0	PFIN	m3	1.000000
33	FGB00030	FG BARECORE LAYER MRE 34x1220x2440	10.1211	RMB00002	ALBASIA FALCATA BARECORE A 10.5x1220x2440	3.1256	FGOD	100	Active	0	GKOP	m3	3.238100
34	FGB00030	FG BARECORE LAYER MRE 34x1220x2440	10.1211	RMB00009	ALBASIA FALCATA BARECORE A 13x1220x2440	7.7396	FGOD	100	Active	1	GKOP	m3	1.307700
35	FGB00030	FG BARECORE LAYER MRE 34x1220x2440	10.1211	SUP00073	PREMIX UL MRE-1	117.1504	FGOD	100	Active	2	GKOP	Kg	0.086400
36	FGB00031	FG BARECORE LAYER MRE 32x912x2355	6.8728	RMB00072	ALBASIA FALCATA BARECORE A 10.5 CENTER CORE	4.9907	FGOD	100	Active	0	GKOP	m3	1.377100
37	FGB00031	FG BARECORE LAYER MRE 32x912x2355	6.8728	RMB00073	ALBASIA FALCATA BARECORE A 13 CENTER CORE	3.0895	FGOD	100	Active	1	GKOP	m3	2.224600
38	FGB00031	FG BARECORE LAYER MRE 32x912x2355	6.8728	SUP00073	PREMIX UL MRE-1	84.3048	FGOD	100	Active	2	GKOP	Kg	0.081500
39	FGB00034	FG BARECORE LAYER MRE 33x780x2300	5.9202	RMB00071	ALBASIA FALCATA BARECORE B 10.5x912x2355	4.5102	FGOD	100	Active	0	GKOP	m3	1.312600
40	FGB00034	FG BARECORE LAYER MRE 33x780x2300	5.9202	RMB00073	ALBASIA FALCATA BARECORE A 13 CENTER CORE	2.7073	FGOD	100	Active	1	GKOP	m3	2.186800
41	FGB00034	FG BARECORE LAYER MRE 33x780x2300	5.9202	SUP00073	PREMIX UL MRE-1	73.8753	FGOD	100	Active	2	GKOP	Kg	0.080100
42	FGB00037	ALBASIA FALCATA BARECORE LAYER MRE 33x650x2350	5.0408	FGB00045	FG BARECORE LAYER MRE 33x650x2350	5.0408	GPAK	100	Active	0	FGOD	m3	1.000000
43	FGB00037	ALBASIA FALCATA BARECORE LAYER MRE 33x650x2350	5.0408	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.050400
44	FGB00038	ALBASIA FALCATA BARECORE LAYER MRE 33x780x2350	6.0489	FGB00044	FG BARECORE LAYER MRE 33x780x2350	6.0489	GPAK	100	Active	0	FGOD	m3	1.000000
45	FGB00038	ALBASIA FALCATA BARECORE LAYER MRE 33x780x2350	6.0489	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.060500
46	FGB00039	ALBASIA FALCATA BARECORE LAYER MRE 33x870x2350	6.7469	FGB00043	FG BARECORE LAYER MRE 33x870x2350	6.7469	GPAK	100	Active	0	FGOD	m3	1.000000
47	FGB00039	ALBASIA FALCATA BARECORE LAYER MRE 33x870x2350	6.7469	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.067500
48	FGB00043	FG BARECORE LAYER MRE 33x870x2350	6.7469	RMB00071	ALBASIA FALCATA BARECORE B 10.5x912x2355	4.5102	FGOD	100	Active	0	GKOP	m3	1.495900
49	FGB00043	FG BARECORE LAYER MRE 33x870x2350	6.7469	RMB00073	ALBASIA FALCATA BARECORE A 13 CENTER CORE	3.0895	FGOD	100	Active	1	GKOP	m3	2.183800
50	FGB00043	FG BARECORE LAYER MRE 33x870x2350	6.7469	SUP00073	PREMIX UL MRE-1	84.3048	FGOD	100	Active	2	GKOP	Kg	0.080000
51	FGB00044	FG BARECORE LAYER MRE 33x780x2350	6.0489	RMB00071	ALBASIA FALCATA BARECORE B 10.5x912x2355	4.5102	FGOD	100	Active	0	GKOP	m3	1.341200
52	FGB00044	FG BARECORE LAYER MRE 33x780x2350	6.0489	RMB00073	ALBASIA FALCATA BARECORE A 13 CENTER CORE	3.0895	FGOD	100	Active	1	GKOP	m3	1.957900
53	FGB00044	FG BARECORE LAYER MRE 33x780x2350	6.0489	SUP00073	PREMIX UL MRE-1	84.3048	FGOD	100	Active	2	GKOP	Kg	0.071800
54	FGB00045	FG BARECORE LAYER MRE 33x650x2350	5.0408	RMB00071	ALBASIA FALCATA BARECORE B 10.5x912x2355	4.5102	FGOD	100	Active	0	GKOP	m3	1.117600
55	FGB00045	FG BARECORE LAYER MRE 33x650x2350	5.0408	RMB00073	ALBASIA FALCATA BARECORE A 13 CENTER CORE	2.3888	FGOD	100	Active	1	GKOP	m3	2.110200
56	FGB00045	FG BARECORE LAYER MRE 33x650x2350	5.0408	SUP00073	PREMIX UL MRE-1	65.1841	FGOD	100	Active	2	GKOP	Kg	0.077300
57	FGB00047	ALBASIA FALCATA BARECORE LAYER MRE 33x850x2350	6.5918	FGD00364	FG DOORCORE 33x850x2350	6.5918	GPAK	100	Active	0	FGOD	m3	1.000000
58	FGB00047	ALBASIA FALCATA BARECORE LAYER MRE 33x850x2350	6.5918	PAK00103	PACKING TUMPUK 73	100	GPAK	100	Active	1	GKPP	Set	0.065900
59	FGB00056	ALBASIA FALCATA BARECORE LAYER MRE 33x670x2250	4.9748	FGB00059	FG BARECORE LAYER MRE 33x670x2250	4.9748	GPAK	100	Active	0	FGOD	m3	1.000000
60	FGB00056	ALBASIA FALCATA BARECORE LAYER MRE 33x670x2250	4.9748	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.049700
61	FGB00057	ALBASIA FALCATA BARECORE LAYER MRE 33x770x2300	5.8443	FGB00061	FG BARECORE LAYER MRE 33x770x2300	5.8443	GPAK	100	Active	0	FGOD	m3	1.000000
62	FGB00057	ALBASIA FALCATA BARECORE LAYER MRE 33x770x2300	5.8443	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKOP	Set	0.058400
63	FGB00058	ALBASIA FALCATA BARECORE LAYER MRE 33x850x2300	6.4515	FGB00063	FG BARECORE LAYER MRE 33x850x2300	6.4515	GPAK	100	Active	0	FGOD	m3	1.000000
64	FGB00058	ALBASIA FALCATA BARECORE LAYER MRE 33x850x2300	6.4515	PAK00103	PACKING TUMPUK 73	100	GPAK	100	Active	1	GKPP	Set	0.064500
65	FGB00059	FG BARECORE LAYER MRE 33x670x2250	4.9748	FGB00060	BARECORE LAYER MRE 33x670x2250	4.9748	FGOD	100	Active	0	PFIN	m3	1.000000
66	FGB00060	BARECORE LAYER MRE 33x670x2250	4.9748	RMB00145	ALBASIA FALCATA BARECORE A 10.5x670x2250	3.1658	PFIN	100	Active	0	GKOP	m3	1.571400
67	FGB00060	BARECORE LAYER MRE 33x670x2250	4.9748	RMB00073	ALBASIA FALCATA BARECORE A 13 CENTER CORE	1.95975	PFIN	100	Active	1	GKOP	m3	2.538500
68	FGB00060	BARECORE LAYER MRE 33x670x2250	4.9748	SUP00099	PREMIX MRE-0 1020	52	PFIN	100	Active	2	GKOP	Kg	0.095700
69	FGB00061	FG BARECORE LAYER MRE 33x770x2300	5.8443	FGB00062	BARECORE LAYER MRE 33x770x2300	5.8443	FGOD	100	Active	0	PFIN	m3	1.000000
70	FGB00062	BARECORE LAYER MRE 33x770x2300	5.8443	RMB00084	ALBASIA FALCATA BARECORE A 10.5x780x2320	3.8002	PFIN	100	Active	0	GKOP	m3	1.537900
71	FGB00062	BARECORE LAYER MRE 33x770x2300	5.8443	RMB00073	ALBASIA FALCATA BARECORE A 13 CENTER CORE	2.3023	PFIN	100	Active	1	GKOP	m3	2.538500
72	FGB00062	BARECORE LAYER MRE 33x770x2300	5.8443	SUP00099	PREMIX MRE-0 1020	102.5	PFIN	100	Active	2	GKOP	Kg	0.057000
73	FGB00063	FG BARECORE LAYER MRE 33x850x2300	6.4515	FGB00064	BARECORE LAYER MRE 33x850x2300	6.4515	FGOD	100	Active	0	PFIN	m3	1.000000
74	FGB00064	BARECORE LAYER MRE 33x850x2300	6.4515	RMB00107	ALBASIA FALCATA BARECORE A 10.5x850x2350	4.1948	PFIN	100	Active	0	GKOP	m3	1.538000
75	FGB00064	BARECORE LAYER MRE 33x850x2300	6.4515	RMB00073	ALBASIA FALCATA BARECORE A 13 CENTER CORE	2.5415	PFIN	100	Active	1	GKOP	m3	2.538500
76	FGB00064	BARECORE LAYER MRE 33x850x2300	6.4515	SUP00099	PREMIX MRE-0 1020	105	PFIN	100	Active	2	GKOP	Kg	0.061400
77	FGD00001	DOORCORE MRE 30x1220x2440	8.9304	WIV00015	VENEER SG 2x1220x2440	1.1908	PFIN	100	Active	0	GKOP	m3	7.499500
78	FGD00001	DOORCORE MRE 30x1220x2440	8.9304	WCD00001	CORE DOORCORE MRE 26x1220x2440	7.7397	PFIN	100	Active	1	WIPA	m3	1.153800
79	FGD00001	DOORCORE MRE 30x1220x2440	8.9304	SUP00073	PREMIX UL MRE-1	76.875	PFIN	100	Active	2	GKOP	Kg	0.116200
80	FGD00006	DOORCORE MRE 40x905x2095	7.5839	WIV00003	VENEER SG 1.3x930x2150	0.5198	PFIN	100	Active	0	GKOP	m3	14.590000
81	FGD00006	DOORCORE MRE 40x905x2095	7.5839	WCD00006	CORE DOORCORE MRE 38x905x2095	7.2047	PFIN	100	Active	1	WIPA	m3	1.052600
82	FGD00006	DOORCORE MRE 40x905x2095	7.5839	SUP00073	PREMIX UL MRE-1	125	PFIN	100	Active	2	GKOP	Kg	0.060700
83	FGD00007	DOORCORE MRE 40x915x2135	7.8141	WIV00046	VENEER LG 1x930x2200	0.4092	PFIN	100	Active	0	GKOP	m3	19.096000
84	FGD00007	DOORCORE MRE 40x915x2135	7.8141	WCD00007	CORE DOORCORE MRE 38x915x2135	7.4234	PFIN	100	Active	1	WIPA	m3	1.052600
85	FGD00007	DOORCORE MRE 40x915x2135	7.8141	SUP00073	PREMIX UL MRE-1	100	PFIN	100	Active	2	GKOP	Kg	0.078100
86	FGD00008	DOORCORE 40x1220x1980	9.6624	WIV00076	VENEER LG 2.6x1220x1900	1.2054	PFIN	100	Active	0	WIVE	m3	8.015900
87	FGD00008	DOORCORE 40x1220x1980	9.6624	WCD00026	CORE DOORCORE 35x1220x1980	8.4546	PFIN	100	Active	1	WIPA	m3	1.142900
88	FGD00008	DOORCORE 40x1220x1980	9.6624	SUP00073	PREMIX UL MRE-1	102.5	PFIN	100	Active	2	GKOP	Kg	0.094300
89	FGD00009	DOORCORE MRE 40x1220x2440	11.9072	WIV00530	VENEER LG 1.3x1220x2500	0.793	PFIN	100	Active	0	GKOP	m3	15.015400
90	FGD00009	DOORCORE MRE 40x1220x2440	11.9072	WCD00047	CORE DOORCORE MRE 38x1220x2440	11.3118	PFIN	100	Active	1	WIPA	m3	1.052600
91	FGD00009	DOORCORE MRE 40x1220x2440	11.9072	SUP00073	PREMIX UL MRE-1	105.9	PFIN	100	Active	2	GKOP	Kg	0.112400
92	FGD00010	DOORCORE 42x900x2100	7.9380	RMB00005	ALBASIA FALCATA BARECORE 13x915x2135	5.0792	PFIN	100	Active	0	WADA	m3	1.562800
93	FGD00010	DOORCORE 42x900x2100	7.9380	RMB00002	ALBASIA FALCATA BARECORE 10.5x1220x2440	3.1256	PFIN	100	Active	1	WADA	m3	2.539700
94	FGD00010	DOORCORE 42x900x2100	7.9380	WIV00046	VENEER LG 1x930x2200	0.4092	PFIN	100	Active	2	WIVE	m3	19.398800
95	FGD00010	DOORCORE 42x900x2100	7.9380	WIV00008	VENEER SG 2x930x2150	0.7998	PFIN	100	Active	3	WIVE	m3	9.925000
96	FGD00010	DOORCORE 42x900x2100	7.9380	SUP00073	PREMIX UL	300	PFIN	100	Active	4	SUPP	Kg	0.026500
97	FGD00013	DOORCORE MRE 44x762x1981	6.6419	WIV00066	VENEER LG 2x930x2200	0.8184	PFIN	100	Active	0	GKOP	m3	8.115700
98	FGD00013	DOORCORE MRE 44x762x1981	6.6419	WCD00008	CORE DOORCORE MRE 42x762x1981	6.34	PFIN	100	Active	1	WIPA	m3	1.047600
99	FGD00013	DOORCORE MRE 44x762x1981	6.6419	SUP00073	PREMIX UL MRE-1	60	PFIN	100	Active	2	GKOP	Kg	0.110700
100	FGD00014	DOORCORE 44x820x2135	7.7031	WCD00009	CORE DOORCORE 42x820x2135	7.3529	PFIN	100	Active	0	WIPA	m3	1.047600
101	FGD00014	DOORCORE 44x820x2135	7.7031	WIV00046	VENEER LG 1x930x2200	0.4092	PFIN	100	Active	1	WIVE	m3	18.824800
102	FGD00014	DOORCORE 44x820x2135	7.7031	SUP00073	PREMIX UL	100	PFIN	100	Active	2	SUPP	Kg	0.077000
103	FGD00015	DOORCORE 44x820x2150	7.7572	WCD00009	CORE DOORCORE 42x820x2135	7.3529	PFIN	100	Active	0	WIPA	m3	1.055000
104	FGD00015	DOORCORE 44x820x2150	7.7572	WIV00286	VENEER LG 1.3x830x2200	0.4748	PFIN	100	Active	1	WVEB	m3	16.337800
105	FGD00015	DOORCORE 44x820x2150	7.7572	SUP00073	PREMIX UL	100	PFIN	100	Active	2	SUPP	Kg	0.077600
106	FGD00016	DOORCORE MRE 44x838x1981	7.3043	WIV00046	VENEER LG 1x930x2200	0.4092	PFIN	100	Active	0	GKOP	m3	17.850200
107	FGD00016	DOORCORE MRE 44x838x1981	7.3043	WCD00050	CORE DOORCORE MRE 42x838x1981	6.9723	PFIN	100	Active	1	WIPA	m3	1.047600
108	FGD00016	DOORCORE MRE 44x838x1981	7.3043	SUP00073	PREMIX UL MRE-1	105.9	PFIN	100	Active	2	GKOP	Kg	0.069000
109	FGD00017	DOORCORE MRE 44x838x2058	7.5883	WIV00046	VENEER LG 1x930x2200	0.4092	PFIN	100	Active	0	GKOP	m3	18.544200
110	FGD00017	DOORCORE MRE 44x838x2058	7.5883	WCD00049	CORE DOORCORE MRE 42x838x2058	7.2433	PFIN	100	Active	1	WIPA	m3	1.047600
111	FGD00017	DOORCORE MRE 44x838x2058	7.5883	SUP00073	PREMIX UL MRE-1	102.5	PFIN	100	Active	2	GKOP	Kg	0.074000
112	FGD00018	DOORCORE 44x905x2095	8.3423	RMB00019	ALBASIA FALCATA BARECORE 16.2x915x2135	9.4941	PFIN	100	Active	0	WADA	m3	0.878700
113	FGD00018	DOORCORE 44x905x2095	8.3423	WIV00003	VENEER SG 1.3x930x2150	0.5198	PFIN	100	Active	1	WIVE	m3	16.049100
114	FGD00018	DOORCORE 44x905x2095	8.3423	SUP00073	PREMIX UL	300	PFIN	100	Active	2	SUPP	Kg	0.027800
115	FGD00019	DOORCORE MRE 44x915x2135	8.5955	WIV00046	VENEER LG 1x930x2200	0.4092	PFIN	100	Active	0	GKOP	m3	21.005600
116	FGD00019	DOORCORE MRE 44x915x2135	8.5955	WCD00010	CORE DOORCORE MRE 42x915x2135	8.2048	PFIN	100	Active	1	WIPA	m3	1.047600
117	FGD00019	DOORCORE MRE 44x915x2135	8.5955	SUP00073	PREMIX UL MRE-1	102	PFIN	100	Active	2	GKOP	Kg	0.084300
118	FGD00020	DOORCORE 44x920x2150	8.7032	WIV00046	VENEER LG 1x930x2200	0.4092	PFIN	100	Active	0	GKOP	m3	21.268800
119	FGD00020	DOORCORE 44x920x2150	8.7032	WCD00015	CORE DOORCORE MRE 42x920x2150	8.3076	PFIN	100	Active	1	WIPA	m3	1.047600
120	FGD00020	DOORCORE 44x920x2150	8.7032	SUP00073	PREMIX UL MRE-1	120	PFIN	100	Active	2	GKOP	Kg	0.072500
121	FGD00021	DOORCORE MRE 44x1220x2440	13.0979	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	21.472000
122	FGD00021	DOORCORE MRE 44x1220x2440	13.0979	WCD00011	CORE DOORCORE MRE 42x1220x2440	12.5026	PFIN	100	Active	1	WIPA	m3	1.047600
123	FGD00021	DOORCORE MRE 44x1220x2440	13.0979	SUP00073	PREMIX UL MRE-1	120	PFIN	100	Active	2	GKOP	Kg	0.109100
124	FGD00022	DOORCORE 44x1232x2451	13.2864	WCD00011	CORE DOORCORE 42x1220x2440	12.5026	PFIN	100	Active	0	WIPA	m3	1.062700
125	FGD00022	DOORCORE 44x1232x2451	13.2864	WIV00049	VENEER LG 1x1220x2440	0.5954	PFIN	100	Active	1	WIVE	m3	22.315100
126	FGD00022	DOORCORE 44x1232x2451	13.2864	SUP00073	PREMIX UL	100	PFIN	100	Active	2	SUPP	Kg	0.132900
127	FGD00024	ALBASIA FALCATA DOORCORE MRE 30x1220x2440	8.9304	FGD00158	FG DOORCORE MRE 30x1220x2440	8.9304	GPAK	100	Active	0	FGOD	m3	1.000000
128	FGD00024	ALBASIA FALCATA DOORCORE MRE 30x1220x2440	8.9304	PAK00137	PACKING BERDIRI 34	100	GPAK	100	Active	1	GKPP	Set	0.089300
129	FGD00025	ALBASIA FALCATA DOORCORE MRE 35x830x2110	6.1296	FGD00183	FG DOORCORE 35x830x2110	6.1296	GPAK	100	Active	0	FGOD	m3	1.000000
130	FGD00025	ALBASIA FALCATA DOORCORE MRE 35x830x2110	6.1296	PAK00142	PACKING TUMPUK 3x7 DC 27	100	GPAK	100	Active	1	GKPP	Set	0.061300
131	FGD00026	ALBASIA FALCATA DOORCORE 35x830x2400	6.9720	FGD00003	DOORCORE 35x830x2400	6.972	GPAK	100	Active	0	FGOD	m3	1.000000
132	FGD00026	ALBASIA FALCATA DOORCORE 35x830x2400	6.9720	PAK00142	PACKING TUMPUK 3x7 DC 27	100	GPAK	100	Active	1	GKPP	Set	0.069700
133	FGD00027	ALBASIA FALCATA DOORCORE 35x815x2135	6.0901	FGD00004	DOORCORE 35x815x2135	6.0901	GPAK	100	Active	0	FGOD	m3	1.000000
134	FGD00027	ALBASIA FALCATA DOORCORE 35x815x2135	6.0901	PAK00142	PACKING TUMPUK 3x7 DC 27	100	GPAK	100	Active	1	GKPP	Set	0.060900
135	FGD00028	ALBASIA FALCATA DOORCORE 35x750x2350	6.1688	FGD00005	DOORCORE 35x750x2350	6.1688	GPAK	100	Active	0	FGOD	m3	1.000000
136	FGD00028	ALBASIA FALCATA DOORCORE 35x750x2350	6.1688	PAK00142	PACKING TUMPUK 3x7 DC 27	100	GPAK	100	Active	1	GKPP	Set	0.061700
137	FGD00029	ALBASIA FALCATA DOORCORE MRE 40x905x2095	7.5839	FGD00134	FG DOORCORE MRE 40x905x2095	7.5839	GPAK	100	Active	0	FGOD	m3	1.000000
138	FGD00029	ALBASIA FALCATA DOORCORE MRE 40x905x2095	7.5839	PAK00084	PACKING TUMPUK 29	100	GPAK	100	Active	1	GKPP	Set	0.075800
139	FGD00030	ALBASIA FALCATA DOORCORE MRE 40x915x2135	7.8141	FGD00135	FG DOORCORE MRE 40x915x2135	7.8141	GPAK	100	Active	0	FGOD	m3	1.000000
140	FGD00030	ALBASIA FALCATA DOORCORE MRE 40x915x2135	7.8141	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.078100
141	FGD00031	ALBASIA FALCATA DOORCORE MRE 40x1220x1980	9.6624	FGD00226	FG DOORCORE 40x1220x1980	9.6624	GPAK	100	Active	0	FGOD	m3	1.000000
142	FGD00031	ALBASIA FALCATA DOORCORE MRE 40x1220x1980	9.6624	PAK00084	PACKING TUMPUK 29	100	GPAK	100	Active	1	GKPP	Set	0.096600
143	FGD00032	ALBASIA FALCATA DOORCORE MRE 40x1220x2440	11.9072	FGD00132	FG DOORCORE MRE 40x1220x2440	11.9072	GPAK	100	Active	0	FGOD	m3	1.000000
144	FGD00032	ALBASIA FALCATA DOORCORE MRE 40x1220x2440	11.9072	PAK00138	PACKING BERDIRI 25	100	GPAK	100	Active	1	GKPP	Set	0.119100
145	FGD00033	ALBASIA FALCATA DOORCORE MRE 42x900x2100	7.9380	FGD00305	FG DOORCORE MRE 42x900x2100	7.938	GPAK	100	Active	0	FGOD	m3	1.000000
146	FGD00033	ALBASIA FALCATA DOORCORE MRE 42x900x2100	7.9380	PAK00142	PACKING TUMPUK 3x7 DC 27	100	GPAK	100	Active	1	GKPP	Set	0.079400
147	FGD00034	ALBASIA FALCATA DOORCORE MRE 42x1220x2440	12.5026	FGD00306	FG DOORCORE 42x1220x2440	12.5026	GPAK	100	Active	0	FGOD	m3	1.000000
148	FGD00034	ALBASIA FALCATA DOORCORE MRE 42x1220x2440	12.5026	PAK00138	PACKING BERDIRI 25	100	GPAK	100	Active	1	GKPP	Set	0.125000
149	FGD00035	ALBASIA FALCATA DOORCORE 44x720x2145	6.7954	FGD00012	DOORCORE 44x720x2145	6.7954	GPAK	100	Active	0	FGOD	m3	1.000000
150	FGD00035	ALBASIA FALCATA DOORCORE 44x720x2145	6.7954	PAK00142	PACKING TUMPUK 3x7 DC 27	100	GPAK	100	Active	1	GKPP	Set	0.068000
151	FGD00036	ALBASIA FALCATA DOORCORE MRE 44x762x1981	6.6419	FGD00207	FG DOORCORE MRE 44x762x1981	6.6419	GPAK	100	Active	0	FGOD	m3	1.000000
152	FGD00036	ALBASIA FALCATA DOORCORE MRE 44x762x1981	6.6419	PAK00142	PACKING TUMPUK 3x7 DC 27	100	GPAK	100	Active	1	GKPP	Set	0.066400
153	FGD00037	ALBASIA FALCATA DOORCORE 44x820x2135	7.7031	FGD00014	DOORCORE 44x820x2135	7.7031	GPAK	100	Active	0	FGOD	m3	1.000000
154	FGD00037	ALBASIA FALCATA DOORCORE 44x820x2135	7.7031	PAK00142	PACKING TUMPUK 3x7 DC 27	100	GPAK	100	Active	1	GKPP	Set	0.077000
155	FGD00038	ALBASIA FALCATA DOORCORE MRE 44x820x2150	7.7572	FGD00192	FG DOORCORE MRE 44x820x2150	7.7572	GPAK	100	Active	0	FGOD	m3	1.000000
156	FGD00038	ALBASIA FALCATA DOORCORE MRE 44x820x2150	7.7572	PAK00142	PACKING TUMPUK 3x7 DC 27	100	GPAK	100	Active	1	GKPP	Set	0.077600
157	FGD00039	ALBASIA FALCATA DOORCORE MRE 44x838x1981	7.3043	FGD00209	FG DOORCORE MRE 44x838x1981	7.3043	GPAK	100	Active	0	FGOD	m3	1.000000
158	FGD00039	ALBASIA FALCATA DOORCORE MRE 44x838x1981	7.3043	PAK00142	PACKING TUMPUK 3x7 DC 27	100	GPAK	100	Active	1	GKPP	Set	0.073000
159	FGD00040	ALBASIA FALCATA DOORCORE MRE 44x838x2058	7.5883	FGD00249	FG DOORCORE MRE 44x838x2058	7.5883	GPAK	100	Active	0	FGOD	m3	1.000000
160	FGD00040	ALBASIA FALCATA DOORCORE MRE 44x838x2058	7.5883	PAK00142	PACKING TUMPUK 3x7 DC 27	100	GPAK	100	Active	1	GKPP	Set	0.075900
161	FGD00041	ALBASIA FALCATA DOORCORE MRE 44x905x2095	8.3423	FGD00018	DOORCORE 44x905x2095	8.3423	GPAK	100	Active	0	FGOD	m3	1.000000
162	FGD00041	ALBASIA FALCATA DOORCORE MRE 44x905x2095	8.3423	PAK00142	PACKING TUMPUK 3x7 DC 27	100	GPAK	100	Active	1	GKPP	Set	0.083400
163	FGD00042	ALBASIA FALCATA DOORCORE MRE 44x915x2135	8.5955	FGD00152	FG DOORCORE MRE 44x915x2135	8.5955	GPAK	100	Active	0	FGOD	m3	1.000000
164	FGD00042	ALBASIA FALCATA DOORCORE MRE 44x915x2135	8.5955	PAK00142	PACKING TUMPUK 3x7 DC 27	100	GPAK	100	Active	1	GKPP	Set	0.086000
165	FGD00043	ALBASIA FALCATA DOORCORE MRE 44x920x2150	8.7032	FGD00130	FG DOORCORE MRE 44x920x2150	8.7032	GPAK	100	Active	0	FGOD	m3	1.000000
166	FGD00043	ALBASIA FALCATA DOORCORE MRE 44x920x2150	8.7032	PAK00142	PACKING TUMPUK 3x7 DC 27	100	GPAK	100	Active	1	GKPP	Set	0.087000
167	FGD00044	ALBASIA FALCATA DOORCORE MRE 44x1220x2440	13.0979	FGD00136	FG DOORCORE MRE 44x1220x2440	13.0979	GPAK	100	Active	0	FGOD	m3	1.000000
168	FGD00044	ALBASIA FALCATA DOORCORE MRE 44x1220x2440	13.0979	PAK00140	PACKING TUMPUK 27	100	GPAK	100	Active	1	GKPP	Set	0.131000
169	FGD00045	ALBASIA FALCATA DOORCORE MRE 44x1232x2451	13.2864	FGD00522	FG DOORCORE MRE 44x1232x2451	13.2864	GPAK	100	Active	0	FGOD	m3	1.000000
170	FGD00045	ALBASIA FALCATA DOORCORE MRE 44x1232x2451	13.2864	PAK00140	PACKING TUMPUK 27	100	GPAK	100	Active	1	GKPP	Set	0.132900
171	FGD00046	ALBASIA FALCATA DOORCORE MRE 44.5x1232x2451	13.4374	FGD00274	FG DOORCORE 44.5x1232x2451	13.4374	GPAK	100	Active	0	FGOD	m3	1.000000
172	FGD00046	ALBASIA FALCATA DOORCORE MRE 44.5x1232x2451	13.4374	PAK00140	PACKING TUMPUK 27	100	GPAK	100	Active	1	GKPP	Set	0.134400
173	FGD00054	DOORCORE 38x1232x2451	11.4746	WCD00018	CORE DOORCORE 36x1220x2440	10.7165	PFIN	100	Active	0	WIPA	m3	1.070700
174	FGD00054	DOORCORE 38x1232x2451	11.4746	WIV00064	VENEER LG 1.3x1220x2440	0.774	PFIN	100	Active	1	WIVE	m3	14.825100
175	FGD00054	DOORCORE 38x1232x2451	11.4746	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	SUPP	Kg	0.115900
176	FGD00059	ALBASIA FALCATA DOORCORE 34x1220x2440	10.1211	FGD00050	DOORCORE 34x1220x2440	10.1211	GPAK	100	Active	0	FGOD	m3	1.000000
177	FGD00059	ALBASIA FALCATA DOORCORE 34x1220x2440	10.1211	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.101200
178	FGD00063	ALBASIA FALCATA DOORCORE WBP 38x1232x2451	11.4746	FGD00244	FG DOORCORE WBP 38x1232x2451	11.4746	GPAK	100	Active	0	FGOD	m3	1.000000
179	FGD00063	ALBASIA FALCATA DOORCORE WBP 38x1232x2451	11.4746	PAK00138	PACKING BERDIRI 25	100	GPAK	100	Active	1	GKPP	Set	0.114700
180	FGD00066	ALBASIA FALCATA DOORCORE MRE 54x1220x2440	16.0747	FGD00166	FG DOORCORE MRE 54x1220x2440	16.0747	GPAK	100	Active	0	FGOD	m3	1.000000
181	FGD00066	ALBASIA FALCATA DOORCORE MRE 54x1220x2440	16.0747	PAK00139	PACKING BERDIRI 23	100	GPAK	100	Active	1	GKPP	Set	0.160700
182	FGD00068	ALBASIA FALCATA DOORCORE MRE 39x1220x2200	10.4676	FGD00322	FG DOORCORE MRE 39x1220x2200	10.4676	GPAK	100	Active	0	FGOD	m3	1.000000
183	FGD00068	ALBASIA FALCATA DOORCORE MRE 39x1220x2200	10.4676	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.104700
184	FGD00072	ALBASIA FALCATA DOORCORE 32x1220x1950	7.6128	FGD00071	DOORCORE 32x1220x1950	7.6128	GPAK	100	Active	0	FGOD	m3	1.000000
185	FGD00072	ALBASIA FALCATA DOORCORE 32x1220x1950	7.6128	PAK00115	PACKING TUMPUK 36	100	GPAK	100	Active	1	GKPP	Set	0.076100
186	FGD00073	DOORCORE 39x1220x2200	10.4676	WCD00012	CORE DOORCORE 37x1220x2200	9.9308	PFIN	100	Active	0	WIPA	m3	1.054100
187	FGD00073	DOORCORE 39x1220x2200	10.4676	WIV00063	VENEER LG 1.3x1220x2200	0.6978	PFIN	100	Active	1	WIVE	m3	15.000900
188	FGD00073	DOORCORE 39x1220x2200	10.4676	SUP00073	PREMIX UL	200	PFIN	100	Active	2	SUPP	Kg	0.052300
189	FGD00076	ALBASIA FALCATA DOORCORE 42x900x2050	7.7490	FGD00075	DOORCORE 42x900x2050	7.749	GPAK	100	Active	0	FGOD	m3	1.000000
190	FGD00076	ALBASIA FALCATA DOORCORE 42x900x2050	7.7490	PAK00140	PACKING TUMPUK 27	100	GPAK	100	Active	1	GKPP	Set	0.077500
191	FGD00077	ALBASIA FALCATA DOORCORE 44x720x2135	6.7637	FGD00078	DOORCORE 44x720x2135	6.7637	GPAK	100	Active	0	FGOD	m3	1.000000
192	FGD00077	ALBASIA FALCATA DOORCORE 44x720x2135	6.7637	PAK00142	PACKING TUMPUK 3x7 DC 27	100	GPAK	100	Active	1	GKPP	Set	0.067600
193	FGD00078	DOORCORE 44x720x2135	6.7637	WCD00022	CORE DOORCORE 42x720x2150	6.5016	PFIN	100	Active	0	WIPA	m3	1.040300
194	FGD00078	DOORCORE 44x720x2135	6.7637	WIV00218	VENEER LG 1.3x770x2300	0.4604	PFIN	100	Active	1	WIVE	m3	14.690900
195	FGD00078	DOORCORE 44x720x2135	6.7637	SUP00073	PREMIX UL MRE-1	102.5	PFIN	100	Active	2	GKOP	Kg	0.066000
196	FGD00080	ALBASIA FALCATA DOORCORE 38x1220x2440	11.3118	FGD00079	DOORCORE 38x1220x2440	11.3118	GPAK	100	Active	0	FGOD	m3	1.000000
197	FGD00080	ALBASIA FALCATA DOORCORE 38x1220x2440	11.3118	PAK00138	PACKING BERDIRI 25	100	GPAK	100	Active	1	GKPP	Set	0.113100
198	FGD00081	ALBASIA FALCATA DOORCORE 57.2x822x2280	10.7202	FGD00082	DOORCORE 57.2x822x2280	10.7202	GPAK	100	Active	0	FGOD	m3	1.000000
199	FGD00081	ALBASIA FALCATA DOORCORE 57.2x822x2280	10.7202	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.107200
200	FGD00083	ALBASIA FALCATA DOORCORE 44x1000x2200	9.6800	FGD00084	DOORCORE 44X1000X2200	9.68	GPAK	100	Active	0	FGOD	m3	1.000000
201	FGD00083	ALBASIA FALCATA DOORCORE 44x1000x2200	9.6800	PAK00140	PACKING TUMPUK 27	100	GPAK	100	Active	1	GKPP	Set	0.096800
202	FGD00085	ALBASIA FALCATA DOORCORE 40x610x2135	5.2094	FGD00097	DOORCORE 40x610x2135	5.2094	GPAK	100	Active	0	FGOD	m3	1.000000
203	FGD00085	ALBASIA FALCATA DOORCORE 40x610x2135	5.2094	PAK00142	PACKING TUMPUK 3x7 DC 27	100	GPAK	100	Active	1	GKPP	Set	0.052100
204	FGD00086	ALBASIA FALCATA DOORCORE WBP 40x1220x2280	11.1264	FGD00090	DOORCORE MRE 40x1220x2280	11.1264	GPAK	100	Active	0	FGOD	m3	1.000000
205	FGD00086	ALBASIA FALCATA DOORCORE WBP 40x1220x2280	11.1264	PAK00084	PACKING TUMPUK 29	100	GPAK	100	Active	1	GKPP	Set	0.111300
206	FGD00087	ALBASIA FALCATA DOORCORE MRE 40x1220x2500	12.2000	FGD00133	FG DOORCORE 40x1220x2500	12.2	GPAK	100	Active	0	FGOD	m3	1.000000
207	FGD00087	ALBASIA FALCATA DOORCORE MRE 40x1220x2500	12.2000	PAK00138	PACKING BERDIRI 25	100	GPAK	100	Active	1	GKPP	Set	0.122000
208	FGD00088	ALBASIA FALCATA DOORCORE + MDF MRE 40x1220x2440	11.9072	FGD00354	FG DOORCORE MDF 40x1220x2440	11.9072	GPAK	100	Active	0	FGOD	m3	1.000000
209	FGD00088	ALBASIA FALCATA DOORCORE + MDF MRE 40x1220x2440	11.9072	PAK00135	PACKING BERDIRI 57	100	GPAK	100	Active	1	GKPP	Set	0.119100
210	FGD00089	ALBASIA FALCATA DOORCORE 38x1000x2135	8.1130	FGD00098	DOORCORE 38x1000x2135	8.113	GPAK	100	Active	0	FGOD	m3	1.000000
211	FGD00089	ALBASIA FALCATA DOORCORE 38x1000x2135	8.1130	PAK00083	PACKING TUMPUK 31	100	GPAK	100	Active	1	GKPP	Set	0.081100
212	FGD00090	DOORCORE 40x1220x2280	11.1264	WIV00031	VENEER SG 2.6x1220x2300	0.394	PFIN	100	Active	0	WIVE	m3	28.239600
213	FGD00090	DOORCORE 40x1220x2280	11.1264	WIV00021	VENEER SG 3x1220x2300	1.229	PFIN	100	Active	1	WIVE	m3	9.053200
214	FGD00090	DOORCORE 40x1220x2280	11.1264	WCD00027	CORE DOORCORE 35x1220x2280	9.7356	PFIN	100	Active	2	WIPA	m3	1.142900
215	FGD00090	DOORCORE 40x1220x2280	11.1264	SUP00073	PREMIX UL	102.5	PFIN	100	Active	3	SUPP	Kg	0.108600
216	FGD00091	ALBASIA FALCATA DOORCORE 30x932x2050	5.7318	FGD00099	DOORCORE MRE 30x932x2050	5.7318	GPAK	100	Active	0	FGOD	m3	1.000000
217	FGD00091	ALBASIA FALCATA DOORCORE 30x932x2050	5.7318	PAK00115	PACKING TUMPUK 36	100	GPAK	100	Active	1	GKPP	Set	0.057300
218	FGD00092	ALBASIA FALCATA DOORCORE MRE 30x932x2350	6.5706	FGD00156	FG DOORCORE MRE 30x932x2350	6.5706	GPAK	100	Active	0	FGOD	m3	1.000000
219	FGD00092	ALBASIA FALCATA DOORCORE MRE 30x932x2350	6.5706	PAK00115	PACKING TUMPUK 36	100	GPAK	100	Active	1	GKPP	Set	0.065700
220	FGD00093	ALBASIA FALCATA DOORCORE MRE 33x932x2050	6.3050	FGD00137	FG DOORCORE 33x932x2050	6.305	GPAK	100	Active	0	FGOD	m3	1.000000
221	FGD00093	ALBASIA FALCATA DOORCORE MRE 33x932x2050	6.3050	PAK00118	PACKING TUMPUK 34	100	GPAK	100	Active	1	GKPP	Set	0.063100
222	FGD00094	ALBASIA FALCATA DOORCORE MRE 33x932x2350	7.2277	FGD00138	FG DOORCORE MRE 33x932x2350	7.2277	GPAK	100	Active	0	FGOD	m3	1.000000
223	FGD00094	ALBASIA FALCATA DOORCORE MRE 33x932x2350	7.2277	PAK00118	PACKING TUMPUK 34	100	GPAK	100	Active	1	GKPP	Set	0.072300
224	FGD00095	ALBASIA FALCATA DOORCORE MRE 38x932x2350	8.3228	FGD00148	FG DOORCORE MRE 38x932x2350	8.3228	GPAK	100	Active	0	FGOD	m3	1.000000
225	FGD00095	ALBASIA FALCATA DOORCORE MRE 38x932x2350	8.3228	PAK00121	PACKING TUMPUK 30	100	GPAK	100	Active	1	GKPP	Set	0.083200
226	FGD00098	DOORCORE 38x1000x2135	8.1130	WIV00064	VENEER LG 1.3x1220x2440	0.774	PFIN	100	Active	0	WIVE	m3	10.481900
227	FGD00098	DOORCORE 38x1000x2135	8.1130	WCD00029	CORE DOORCORE 35.4x1000x2135	7.5579	PFIN	100	Active	1	WIPA	m3	1.073400
228	FGD00098	DOORCORE 38x1000x2135	8.1130	SUP00079	PREMIX UL MRE-0	102.5	PFIN	100	Active	2	GKOP	Kg	0.079200
229	FGD00099	DOORCORE 30x932x2050	5.7318	WIV00008	VENEER SG 2x930x2150	0.7998	PFIN	100	Active	0	WIVE	m3	7.166500
230	FGD00099	DOORCORE 30x932x2050	5.7318	WCD00031	CORE DOORCORE 26x932x2050	4.9676	PFIN	100	Active	1	WIPA	m3	1.153800
231	FGD00099	DOORCORE 30x932x2050	5.7318	SUP00073	PREMIX UL	102.5	PFIN	100	Active	2	GKOP	Kg	0.055900
232	FGD00100	DOORCORE 30x932x2350	6.5706	WIV00372	VENEER SG 2x930x2400	1	PFIN	100	Active	0	WIVE	m3	6.570600
233	FGD00100	DOORCORE 30x932x2350	6.5706	WCD00032	CORE DOORCORE 26x932x2350	1	PFIN	100	Active	1	WIPA	m3	6.570600
234	FGD00100	DOORCORE 30x932x2350	6.5706	SUP00073	PREMIX UL MRE-1	102.5	PFIN	100	Active	2	GKOP	Kg	0.064100
235	FGD00103	DOORCORE 38x932x2350	8.3228	WIV00062	VENEER LG 1.3x930x2440	1	PFIN	100	Active	0	WIVE	m3	8.322800
236	FGD00103	DOORCORE 38x932x2350	8.3228	WCD00035	CORE DOORCORE 36x932x2350	1	PFIN	100	Active	1	WIPA	m3	8.322800
237	FGD00103	DOORCORE 38x932x2350	8.3228	SUP00073	PREMIX UL MRE-1	102.5	PFIN	100	Active	2	GKOP	Kg	0.081200
238	FGD00105	ALBASIA FALCATA DOORCORE MRE 35x820x2420	6.9454	FGD00108	DOORCORE MRE 35x820x2420	6.9454	GPAK	100	Active	0	FGOD	m3	1.000000
239	FGD00105	ALBASIA FALCATA DOORCORE MRE 35x820x2420	6.9454	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.069500
240	FGD00106	ALBASIA FALCATA DOORCORE MRE 35x920x2420	7.7924	FGD00510	FG DOORCORE MRE 35x920x2420	7.7924	GPAK	100	Active	0	FGOD	m3	1.000000
241	FGD00106	ALBASIA FALCATA DOORCORE MRE 35x920x2420	7.7924	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.077900
242	FGD00109	DOORCORE 35x920x2420	7.7924	WIV00067	VENEER LG 2x930x2440	0.9076	PFIN	100	Active	0	WIVE	m3	8.585700
243	FGD00109	DOORCORE 35x920x2420	7.7924	WCD00040	CORE DOORCORE 33x920x2420	7.3471	PFIN	100	Active	1	WIPA	m3	1.060600
244	FGD00109	DOORCORE 35x920x2420	7.7924	SUP00073	PREMIX UL	100	PFIN	100	Active	2	GKOP	Kg	0.077900
245	FGD00110	ALBASIA FALCATA DOORCORE MRE 37x913x2037	6.8812	FGD00115	DOORCORE 37X913X2037	6.8812	GPAK	100	Active	0	FGOD	m3	1.000000
246	FGD00110	ALBASIA FALCATA DOORCORE MRE 37x913x2037	6.8812	PAK00121	PACKING TUMPUK 30	100	GPAK	100	Active	1	GKPP	Set	0.068800
247	FGD00111	ALBASIA FALCATA DOORCORE MRE 37x1013x2037	7.6349	FGD00116	DOORCORE 37X1013X2037	7.6349	GPAK	100	Active	0	FGOD	m3	1.000000
248	FGD00111	ALBASIA FALCATA DOORCORE MRE 37x1013x2037	7.6349	PAK00121	PACKING TUMPUK 30	100	GPAK	100	Active	1	GKPP	Set	0.076300
249	FGD00112	ALBASIA FALCATA DOORCORE MRE 37x913x2336	7.8912	FGD00117	DOORCORE 37X913X2336	7.8912	GPAK	100	Active	0	FGOD	m3	1.000000
250	FGD00112	ALBASIA FALCATA DOORCORE MRE 37x913x2336	7.8912	PAK00121	PACKING TUMPUK 30	100	GPAK	100	Active	1	GKPP	Set	0.078900
251	FGD00113	ALBASIA FALCATA DOORCORE MRE 33x932x2340	7.1969	FGD00118	DOORCORE 33x932x2340	7.1969	GPAK	100	Active	0	FGOD	m3	1.000000
252	FGD00113	ALBASIA FALCATA DOORCORE MRE 33x932x2340	7.1969	PAK00118	PACKING TUMPUK 34	100	GPAK	100	Active	1	GKPP	Set	0.072000
253	FGD00114	ALBASIA FALCATA DOORCORE MRE 38x932x2340	8.2873	FGD00119	DOORCORE 38x932x2340	8.2873	GPAK	100	Active	0	FGOD	m3	1.000000
254	FGD00114	ALBASIA FALCATA DOORCORE MRE 38x932x2340	8.2873	PAK00121	PACKING TUMPUK 30	100	GPAK	100	Active	1	GKPP	Set	0.082900
255	FGD00117	DOORCORE 37X913X2336	7.6349	WIV00376	VENEER SG 1.3x930x2440	0.59	PFIN	100	Active	0	WIVE	m3	12.940500
256	FGD00117	DOORCORE 37X913X2336	7.6349	WCD00041	CORE DOORCORE 35x913x2336	7.4647	PFIN	100	Active	1	WIPA	m3	1.022800
257	FGD00117	DOORCORE 37X913X2336	7.6349	SUP00073	PREMIX UL MRE-1	102.5	PFIN	100	Active	2	GKOP	Kg	0.074500
258	FGD00119	DOORCORE 38x932x2340	8.2873	WIV00067	VENEER LG 2x930x2440	0.9076	PFIN	100	Active	0	WIVE	m3	9.131000
259	FGD00119	DOORCORE 38x932x2340	8.2873	WCD00045	CORE DOORCORE 35x932x2340	7.6331	PFIN	100	Active	1	WIPA	m3	1.085700
260	FGD00119	DOORCORE 38x932x2340	8.2873	SUP00073	PREMIX UL MRE-1	102.5	PFIN	100	Active	2	GKOP	Kg	0.080900
261	FGD00120	ALBASIA FALCATA DOORCORE MRE 44.5x1232x2781	15.2466	FGD00124	DOORCORE 44.5x1232x2781	15.2466	GPAK	100	Active	0	FGOD	m3	1.000000
262	FGD00120	ALBASIA FALCATA DOORCORE MRE 44.5x1232x2781	15.2466	PAK00140	PACKING TUMPUK 27	100	GPAK	100	Active	1	GKPP	Set	0.152500
263	FGD00121	DOORCORE MRE 38x932x2050	7.2603	WIV00008	VENEER SG 2x930x2150	0.7998	PFIN	100	Active	0	GKOP	m3	9.077600
264	FGD00121	DOORCORE MRE 38x932x2050	7.2603	WCD00053	CORE DOORCORE MRE 36x932x2050	6.8782	PFIN	100	Active	1	WIPA	m3	1.055600
265	FGD00121	DOORCORE MRE 38x932x2050	7.2603	SUP00073	PREMIX UL MRE-1	102.5	PFIN	100	Active	2	GKOP	Kg	0.070800
266	FGD00121	DOORCORE MRE 38x932x2050	7.2603	SUP00005	LEM PROTECTA C-3, BC 23	0.05	PFIN	100	Active	3	GKOP	kg	145.206000
267	FGD00122	ALBASIA FALCATA DOORCORE MRE 38x932x2050	7.2603	FGD00147	FG DOORCORE MRE 38x932x2050	7.2603	GPAK	100	Active	0	FGOD	m3	1.000000
268	FGD00122	ALBASIA FALCATA DOORCORE MRE 38x932x2050	7.2603	PAK00121	PACKING TUMPUK 30	100	GPAK	100	Active	1	GKPP	Set	0.072600
269	FGD00123	ALBASIA FALCATA DOORCORE WBP 31.8x1232x2451	9.6024	FGD00472	FG DOORCORE WBP 31.8x1232x2451	9.6024	GPAK	100	Active	0	FGOD	m3	1.000000
270	FGD00123	ALBASIA FALCATA DOORCORE WBP 31.8x1232x2451	9.6024	PAK00140	PACKING TUMPUK 27	100	GPAK	100	Active	1	GKPP	Set	0.096000
271	FGD00124	DOORCORE 44.5x1232x2781	15.2466	WCD00052	CORE DOORCORE 39.5x1232x2781	13.5335	PFIN	100	Active	0	WIPA	m3	1.126600
272	FGD00124	DOORCORE 44.5x1232x2781	15.2466	RMM00020	MDF 2.5x1232x2781	1.713	PFIN	100	Active	1	GKOP	m3	8.900500
273	FGD00124	DOORCORE 44.5x1232x2781	15.2466	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.154000
274	FGD00125	DOORCORE 31.8x1232x2451	9.6024	WCD00001	CORE DOORCORE 26x1220x2440	7.7397	PFIN	100	Active	0	WIPA	m3	1.240700
275	FGD00125	DOORCORE 31.8x1232x2451	9.6024	RMM00012	MDF 2.5x1265x2485	1.5718	PFIN	100	Active	1	GKOP	m3	6.109200
276	FGD00125	DOORCORE 31.8x1232x2451	9.6024	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.097000
277	FGD00126	ALBASIA FALCATA DOORCORE MRE 29x810x1810	4.2517	FGD00131	FG DOORCORE MRE 29x810x1810	4.2517	GPAK	100	Active	0	FGOD	m3	1.000000
278	FGD00126	ALBASIA FALCATA DOORCORE MRE 29x810x1810	4.2517	PAK00115	PACKING TUMPUK 36	100	GPAK	100	Active	1	GKPP	Set	0.042500
279	FGD00127	ALBASIA FALCATA DOORCORE MRE 38x700x2000	5.3200	FGD00128	DOORCORE 38x700x2000	5.32	GPAK	100	Active	0	FGOD	m3	1.000000
280	FGD00127	ALBASIA FALCATA DOORCORE MRE 38x700x2000	5.3200	PAK00121	PACKING TUMPUK 30	100	GPAK	100	Active	1	GKPP	Set	0.053200
281	FGD00128	DOORCORE 38x700x2000	5.3200	WIV00299	VENEER LG 1.3x770x2200	0.4404	PFIN	100	Active	0	GKOP	m3	12.079900
282	FGD00128	DOORCORE 38x700x2000	5.3200	WCD00056	CORE DOORCORE 36x700x2000	5.04	PFIN	100	Active	1	WIPA	m3	1.055600
283	FGD00128	DOORCORE 38x700x2000	5.3200	SUP00073	PREMIX UL MRE-1	102.5	PFIN	100	Active	2	GKOP	Kg	0.051900
284	FGD00129	DOORCORE MRE 29x810x1810	4.2517	WIV00008	VENEER SG 2x930x2150	0.7998	PFIN	100	Active	0	GKOP	m3	5.316000
285	FGD00129	DOORCORE MRE 29x810x1810	4.2517	WCD00058	CORE DOORCORE MRE 27x810x1810	3.9585	PFIN	100	Active	1	WIPA	m3	1.074100
286	FGD00129	DOORCORE MRE 29x810x1810	4.2517	SUP00073	PREMIX UL MRE-1	102	PFIN	100	Active	2	GKOP	Kg	0.041700
287	FGD00130	FG DOORCORE MRE 44x920x2150	8.7032	FGD00020	DOORCORE MRE 44x920x2150	8.7032	FGOD	100	Active	0	PFIN	m3	1.000000
288	FGD00131	FG DOORCORE 29x810x1810	4.2517	FGD00129	DOORCORE 29x810x1810	4.2517	FGOD	100	Active	0	PFIN	m3	1.000000
289	FGD00132	FG DOORCORE MRE 40x1220x2440	11.9072	FGD00009	DOORCORE MRE 40x1220x2440	11.9072	FGOD	100	Active	0	PFIN	m3	1.000000
290	FGD00134	FG DOORCORE MRE 40x905x2095	7.5839	FGD00006	DOORCORE MRE 40x905x2095	7.5839	FGOD	100	Active	0	PFIN	m3	1.000000
291	FGD00135	FG DOORCORE MRE 40x915x2135	7.8141	FGD00007	DOORCORE MRE 40x915x2135	7.8141	FGOD	100	Active	0	PFIN	m3	1.000000
292	FGD00136	FG DOORCORE MRE 44x1220x2440	13.0979	FGD00021	DOORCORE MRE 44x1220x2440	13.0979	FGOD	100	Active	0	PFIN	m3	1.000000
293	FGD00137	FG DOORCORE 33x932x2050	6.3050	WIV00061	VENEER LG 1.3x930x2200	0.532	FGOD	100	Active	0	GKOP	m3	11.851500
294	FGD00137	FG DOORCORE 33x932x2050	6.3050	RMB00060	ALBASIA FALCATA BARECORE A 13x932x2050	4.9676	FGOD	100	Active	1	GKOP	m3	1.269200
295	FGD00137	FG DOORCORE 33x932x2050	6.3050	WIV00008	VENEER SG 2x930x2150	1.1997	FGOD	100	Active	2	GKOP	m3	5.255500
296	FGD00137	FG DOORCORE 33x932x2050	6.3050	SUP00073	PREMIX UL MRE-1	232.2682	FGOD	100	Active	3	GKOP	Kg	0.027100
297	FGD00138	FG DOORCORE MRE 33x932x2350	7.2277	WIV00047	VENEER LG 1x930x2440	0.4538	FGOD	100	Active	0	GKOP	m3	15.927100
298	FGD00138	FG DOORCORE MRE 33x932x2350	7.2277	RMB00061	ALBASIA FALCATA BARECORE A 13x932x2350	5.6946	FGOD	100	Active	1	GKOP	m3	1.269200
299	FGD00138	FG DOORCORE MRE 33x932x2350	7.2277	WIV00372	VENEER SG 2x930x2400	1.3392	FGOD	100	Active	2	GKOP	m3	5.397000
300	FGD00138	FG DOORCORE MRE 33x932x2350	7.2277	SUP00073	PREMIX UL MRE-1	266.3342	FGOD	100	Active	3	GKOP	Kg	0.027100
301	FGD00145	R DOORCORE 40x905x2095	1.0927	FGD00006	DOORCORE 40x905x2095	1	GRPF	100	Active	0	PFIN	m3	1.092700
302	FGD00147	FG DOORCORE MRE 38x932x2050	7.2603	FGD00121	DOORCORE MRE 38x932x2050	7.2603	FGOD	100	Active	0	PFIN	m3	1.000000
303	FGD00148	FG DOORCORE MRE 38x932x2350	8.3228	WIV00062	VENEER LG 1.3x930x2440	0.59	FGOD	100	Active	0	GKOP	m3	14.106400
304	FGD00148	FG DOORCORE MRE 38x932x2350	8.3228	WIV00008	VENEER SG 2x930x2150	1.9995	FGOD	100	Active	1	GKOP	m3	4.162400
305	FGD00148	FG DOORCORE MRE 38x932x2350	8.3228	RMB00106	ALBASIA FALCATA BARECORE A 13x932x2300	5.5734	FGOD	100	Active	2	GKOP	m3	1.493300
306	FGD00148	FG DOORCORE MRE 38x932x2350	8.3228	SUP00073	PREMIX UL MRE-1	355.1123	FGOD	100	Active	3	GKOP	Kg	0.023400
307	FGD00152	FG DOORCORE MRE 44x915x2135	8.5955	FGD00019	DOORCORE MRE 44x915x2135	8.5955	FGOD	100	Active	0	PFIN	m3	1.000000
308	FGD00153	R DOORCORE 44x915x2135	1.0927	FGD00019	DOORCORE 44x915x2135	1	GRPF	100	Active	0	PFIN	m3	1.092700
309	FGD00154	ALBASIA FALCATA DOORCORE MRE 30x1050x2200	6.9300	FGD00189	FG DOORCORE MRE 30x1050x2200	6.93	GPAK	100	Active	0	FGOD	m3	1.000000
310	FGD00154	ALBASIA FALCATA DOORCORE MRE 30x1050x2200	6.9300	PAK00112	PACKING TUMPUK 41	100	GPAK	100	Active	1	GKPP	Set	0.069300
311	FGD00156	FG DOORCORE MRE 30x932x2350	6.5706	WIV00372	VENEER SG 2x930x2400	0.8928	FGOD	100	Active	0	GKOP	m3	7.359500
312	FGD00156	FG DOORCORE MRE 30x932x2350	6.5706	RMB00072	ALBASIA FALCATA BARECORE A 10.5 CENTER CORE	2.4444	FGOD	100	Active	1	GKOP	m3	2.688000
313	FGD00156	FG DOORCORE MRE 30x932x2350	6.5706	RMB00106	ALBASIA FALCATA BARECORE A 13x932x2300	5.5734	FGOD	100	Active	2	GKOP	m3	1.178900
314	FGD00156	FG DOORCORE MRE 30x932x2350	6.5706	SUP00073	PREMIX UL MRE-1	177.5561	FGOD	100	Active	3	GKOP	Kg	0.037000
315	FGD00158	FG DOORCORE MRE 30x1220x2440	8.9304	FGD00001	DOORCORE MRE 30x1220x2440	8.9304	FGOD	100	Active	0	PFIN	m3	1.000000
316	FGD00166	FG DOORCORE MRE 54x1220x2440	16.0747	WIV00527	VENEER LG 1x1220x2500	0.61	FGOD	100	Active	0	GKOP	m3	26.352000
317	FGD00166	FG DOORCORE MRE 54x1220x2440	16.0747	WIV00015	VENEER SG 2x1220x2440	1.1908	FGOD	100	Active	1	GKOP	m3	13.499100
318	FGD00166	FG DOORCORE MRE 54x1220x2440	16.0747	RMB00030	ALBASIA FALCATA BARECORE A 18.7x1220x2440	66.7992	FGOD	100	Active	2	GKOP	m3	0.240600
319	FGD00166	FG DOORCORE MRE 54x1220x2440	16.0747	SUP00093	LEM HENKEL AQUENCE SL 8460 BC, 4.0	330	FGOD	100	Active	3	GKOP	kg	0.048700
320	FGD00166	FG DOORCORE MRE 54x1220x2440	16.0747	SUP00094	HARDENER HENKEL CATALYST 72-7357 M BC, 4.0	150	FGOD	100	Active	4	GKOP	kg	0.107200
321	FGD00183	FG DOORCORE 35x830x2110	6.1296	WIV00008	VENEER SG 2x930x2150	0.7998	FGOD	100	Active	0	GKOP	m3	7.663900
322	FGD00183	FG DOORCORE 35x830x2110	6.1296	RMB00072	ALBASIA FALCATA BARECORE A 10.5 CENTER CORE	6.8749	FGOD	100	Active	1	GKOP	m3	0.891600
323	FGD00183	FG DOORCORE 35x830x2110	6.1296	SUP00073	PREMIX UL MRE-1	154.8455	FGOD	100	Active	2	GKOP	Kg	0.039600
324	FGD00187	DOORCORE 30x1050x2200	6.9300	SUP00073	PREMIX UL MRE-1	102.5	PFIN	100	Active	0	GKOP	Kg	0.067600
325	FGD00187	DOORCORE 30x1050x2200	6.9300	WIV00412	VENEER SG 1.3x1220x2300	0.7296	PFIN	100	Active	1	GKOP	m3	9.498400
326	FGD00187	DOORCORE 30x1050x2200	6.9300	WCD00060	CORE DOORCORE 28x1050x2200	6.468	PFIN	100	Active	2	WIPA	m3	1.071400
327	FGD00189	FG DOORCORE MRE 30x1050x2200	6.9300	WIV00412	VENEER SG 1.3x1220x2300	0.7296	FGOD	100	Active	0	GKOP	m3	9.498400
328	FGD00189	FG DOORCORE MRE 30x1050x2200	6.9300	RMB00078	ALBASIA FALCATA BARECORE A 10.5x1050x2200	4.851	FGOD	100	Active	1	GKOP	m3	1.428600
329	FGD00189	FG DOORCORE MRE 30x1050x2200	6.9300	RMB00072	ALBASIA FALCATA BARECORE A 10.5 CENTER CORE	3.4675	FGOD	100	Active	2	GKOP	m3	1.998600
330	FGD00189	FG DOORCORE MRE 30x1050x2200	6.9300	SUP00073	PREMIX UL MRE-1	234.3009	FGOD	100	Active	3	GKOP	Kg	0.029600
331	FGD00192	FG DOORCORE MRE 44x820x2150	7.7572	WIV00046	VENEER LG 1x930x2200	0.4092	FGOD	100	Active	0	GKOP	m3	18.957000
332	FGD00192	FG DOORCORE MRE 44x820x2150	7.7572	WIV00008	VENEER SG 2x930x2150	0.7998	FGOD	100	Active	1	GKOP	m3	9.698900
333	FGD00192	FG DOORCORE MRE 44x820x2150	7.7572	RMB00100	ALBASIA FALCATA BARECORE B 13x920x2150	5.1428	FGOD	100	Active	2	GKOP	m3	1.508400
334	FGD00192	FG DOORCORE MRE 44x820x2150	7.7572	RMB00117	ALBASIA FALCATA BARECORE B 13 CENTER CORE	2.6013	FGOD	100	Active	3	GKOP	m3	2.982000
335	FGD00192	FG DOORCORE MRE 44x820x2150	7.7572	SUP00073	PREMIX UL MRE-1	212.9524	FGOD	100	Active	4	GKOP	Kg	0.036400
336	FGD00193	ALBASIA FALCATA DOORCORE MRE 27.6x932x2350	6.0450	FGD00200	FG DOORCORE MRE 27.6x932x2350	6.045	GPAK	100	Active	0	FGOD	m3	1.000000
337	FGD00193	ALBASIA FALCATA DOORCORE MRE 27.6x932x2350	6.0450	PAK00112	PACKING TUMPUK 41	100	GPAK	100	Active	1	GKPP	Set	0.060500
338	FGD00200	FG DOORCORE MRE 27.6x932x2350	6.0450	WIV00066	VENEER LG 2x930x2200	0.8184	FGOD	100	Active	0	GKOP	m3	7.386400
339	FGD00200	FG DOORCORE MRE 27.6x932x2350	6.0450	RMB00072	ALBASIA FALCATA BARECORE A 10.5 CENTER CORE	2.4851	FGOD	100	Active	1	GKOP	m3	2.432500
340	FGD00200	FG DOORCORE MRE 27.6x932x2350	6.0450	RMB00106	ALBASIA FALCATA BARECORE A 13x932x2300	5.5734	FGOD	100	Active	2	GKOP	m3	1.084600
341	FGD00200	FG DOORCORE MRE 27.6x932x2350	6.0450	SUP00073	PREMIX UL MRE-1	167.9213	FGOD	100	Active	3	GKOP	Kg	0.036000
342	FGD00207	FG DOORCORE 44x762x1981	6.6419	FGD00013	DOORCORE 44x762x1981	6.6419	FGOD	100	Active	0	PFIN	m3	1.000000
343	FGD00209	FG DOORCORE MRE 44x838x1981	7.3043	FGD00016	DOORCORE MRE 44x838x1981	7.3043	FGOD	100	Active	0	PFIN	m3	1.000000
344	FGD00214	ALBASIA FALCATA DOORCORE MRE 33x1250x2500	10.3125	FGD00233	FG DOORCORE 33x1250x2500	10.3125	GPAK	100	Active	0	FGOD	m3	1.000000
345	FGD00214	ALBASIA FALCATA DOORCORE MRE 33x1250x2500	10.3125	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.103100
346	FGD00215	ALBASIA FALCATA DOORCORE MRE 33x920x2150	6.5274	FGD00497	FG DOORCORE MRE 33x920x2150	6.5274	GPAK	100	Active	0	FGOD	m3	1.000000
347	FGD00215	ALBASIA FALCATA DOORCORE MRE 33x920x2150	6.5274	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	SUPP	Set	0.065300
348	FGD00216	ALBASIA FALCATA DOORCORE MRE 36x780x2320	6.5146	FGD00221	FG DOORCORE 36x780x2320	6.5146	GPAK	100	Active	0	FGOD	m3	1.000000
349	FGD00216	ALBASIA FALCATA DOORCORE MRE 36x780x2320	6.5146	PAK00083	PACKING TUMPUK 31	1	GPAK	100	Active	1	GKPP	Set	6.514600
350	FGD00221	FG DOORCORE 36x780x2320	6.5146	WIV00067	VENEER LG 2x930x2440	0.9076	FGOD	100	Active	0	GKOP	m3	7.177800
351	FGD00221	FG DOORCORE 36x780x2320	6.5146	RMB00073	ALBASIA FALCATA BARECORE A 13 CENTER CORE	2.717	FGOD	100	Active	1	GKOP	m3	2.397700
352	FGD00221	FG DOORCORE 36x780x2320	6.5146	RMB00072	ALBASIA FALCATA BARECORE A 10.5 CENTER CORE	4.389	FGOD	100	Active	2	GKOP	m3	1.484300
353	FGD00221	FG DOORCORE 36x780x2320	6.5146	SUP00073	PREMIX UL MRE-1	148.2827	FGOD	100	Active	3	GKOP	Kg	0.043900
354	FGD00222	R DOORCORE 40x1220x1980	1.2200	FGD00008	DOORCORE 40x1220x1980	1	GRPF	100	Active	0	PFIN	m3	1.220000
355	FGD00225	R DOORCORE 40x1220x2280	1.2200	FGD00090	DOORCORE 40x1220x2280	1	GRPF	100	Active	0	PFIN	m3	1.220000
356	FGD00226	FG DOORCORE 40x1220x1980	9.6624	WIV00324	VENEER LG 2.6x1220x2000	1.2688	FGOD	100	Active	0	GKOP	m3	7.615400
357	FGD00226	FG DOORCORE 40x1220x1980	9.6624	RMB00056	ALBASIA FALCATA BARECORE B 13x1220x1980	6.2806	FGOD	100	Active	1	GKOP	m3	1.538500
358	FGD00226	FG DOORCORE 40x1220x1980	9.6624	RMB00072	ALBASIA FALCATA BARECORE A 10.5 CENTER CORE	3.0912	FGOD	100	Active	2	GKOP	m3	3.125800
359	FGD00226	FG DOORCORE 40x1220x1980	9.6624	SUP00073	PREMIX UL MRE-1	208.8729	FGOD	100	Active	3	GKOP	Kg	0.046300
360	FGD00227	FG DOORCORE 40x1220x2280	11.1264	WIV00027	VENEER SG 2.6x1220x2000	1.2688	FGOD	100	Active	0	GKOP	m3	8.769200
361	FGD00227	FG DOORCORE 40x1220x2280	11.1264	RMB00009	ALBASIA FALCATA BARECORE A 13x1220x2440	7.7396	FGOD	100	Active	1	GKOP	m3	1.437600
362	FGD00227	FG DOORCORE 40x1220x2280	11.1264	RMB00072	ALBASIA FALCATA BARECORE A 10.5 CENTER CORE	3.0912	FGOD	100	Active	2	GKOP	m3	3.599400
363	FGD00227	FG DOORCORE 40x1220x2280	11.1264	SUP00073	PREMIX UL MRE-1	208.8729	FGOD	100	Active	3	GKOP	Kg	0.053300
364	FGD00229	ALBASIA FALCATA DOORCORE MRE 34x1000x2500	8.5000	FGD00239	FG DOORCORE 34x1000x2500	8.5	GPAK	100	Active	0	FGOD	m3	1.000000
365	FGD00229	ALBASIA FALCATA DOORCORE MRE 34x1000x2500	8.5000	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.085000
366	FGD00239	FG DOORCORE 34x1000x2500	8.5000	WIV00015	VENEER SG 2x1220x2440	1.1908	FGOD	100	Active	0	GKOP	m3	7.138100
367	FGD00239	FG DOORCORE 34x1000x2500	8.5000	RMB00086	ALBASIA FALCATA BARECORE A 15.2x1000x2500	7.6	FGOD	100	Active	1	GKOP	m3	1.118400
368	FGD00239	FG DOORCORE 34x1000x2500	8.5000	SUP00099	PREMIX MRE-0 1020	227.0357	FGOD	100	Active	2	GKOP	Kg	0.037400
369	FGD00240	R DOORCORE 38x1232x2451	1.2200	FGD00054	DOORCORE 38x1232x2451	1	GRPF	100	Active	0	PFIN	m3	1.220000
370	FGD00244	FG DOORCORE WBP 38x1232x2451	11.4746	WIV00434	VENEER SG 1.7x1220x2440	1.0122	FGOD	100	Active	0	GKOP	m3	11.336300
371	FGD00244	FG DOORCORE WBP 38x1232x2451	11.4746	RMB00002	ALBASIA FALCATA BARECORE A 10.5x1220x2440	3.1256	FGOD	100	Active	1	GKOP	m3	3.671200
372	FGD00244	FG DOORCORE WBP 38x1232x2451	11.4746	RMB00009	ALBASIA FALCATA BARECORE A 13x1220x2440	7.7396	FGOD	100	Active	2	GKOP	m3	1.482600
373	FGD00244	FG DOORCORE WBP 38x1232x2451	11.4746	SUP00075	PREMIX BONDTITE	222.5504	FGOD	100	Active	3	GKOP	Kg	0.051600
374	FGD00245	FG DOORCORE WBP 44x1232x2451	13.2864	WIV00527	VENEER LG 1x1220x2500	0.61	FGOD	100	Active	0	GKOP	m3	21.781000
375	FGD00245	FG DOORCORE WBP 44x1232x2451	13.2864	RMB00009	ALBASIA FALCATA BARECORE A 13x1220x2440	11.6094	FGOD	100	Active	1	GKOP	m3	1.144500
376	FGD00245	FG DOORCORE WBP 44x1232x2451	13.2864	WIV00015	VENEER SG 2x1220x2440	1.1908	FGOD	100	Active	2	GKOP	m3	11.157500
377	FGD00245	FG DOORCORE WBP 44x1232x2451	13.2864	SUP00073	PREMIX UL MRE-1	351.4513	FGOD	100	Active	3	GKOP	Kg	0.037800
378	FGD00249	FG DOORCORE MRE 44x838x2058	7.5883	FGD00017	DOORCORE MRE 44x838x2058	7.5883	FGOD	100	Active	0	PFIN	m3	1.000000
379	FGD00257	ALBASIA FALCATA DOORCORE MRE 34x900x2200	6.7320	FGD00273	FG DOORCORE MRE 34x900x2200	6.732	GPAK	100	Active	0	FGOD	m3	1.000000
380	FGD00257	ALBASIA FALCATA DOORCORE MRE 34x900x2200	6.7320	PAK00118	PACKING TUMPUK 34	100	GPAK	100	Active	1	GKPP	Set	0.067300
381	FGD00273	FG DOORCORE MRE 34x900x2200	6.7320	WIV00267	VENEER SG 2x930x2300	0.8556	FGOD	100	Active	0	GKOP	m3	7.868200
382	FGD00273	FG DOORCORE MRE 34x900x2200	6.7320	RMB00001	ALBASIA FALCATA BARECORE A 10.5x991x2440	7.6167	FGOD	100	Active	1	GKOP	m3	0.883800
383	FGD00273	FG DOORCORE MRE 34x900x2200	6.7320	SUP00099	PREMIX MRE-0 1020	165.1685	FGOD	100	Active	2	GKOP	Kg	0.040800
384	FGD00276	ALBASIA FALCATA DOORCORE WBP 25x1232x2451	7.5491	FGD00283	FG DOORCORE WBP 25x1232x2451	7.5491	GPAK	100	Active	0	FGOD	m3	1.000000
385	FGD00276	ALBASIA FALCATA DOORCORE WBP 25x1232x2451	7.5491	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.075500
386	FGD00283	FG DOORCORE WBP 25x1232x2451	7.5491	WIV00434	VENEER SG 1.7x1220x2440	1.0122	FGOD	100	Active	0	GKOP	m3	7.458100
387	FGD00283	FG DOORCORE WBP 25x1232x2451	7.5491	WIV00015	VENEER SG 2x1220x2440	0.5954	FGOD	100	Active	1	GKOP	m3	12.679000
388	FGD00283	FG DOORCORE WBP 25x1232x2451	7.5491	RMB00037	ALBASIA FALCATA BARECORE A 10.5x1232x2451	6.3412	FGOD	100	Active	2	GKOP	m3	1.190500
389	FGD00283	FG DOORCORE WBP 25x1232x2451	7.5491	SUP00075	PREMIX BONDTITE	234.3009	FGOD	100	Active	3	GKOP	Kg	0.032200
390	FGD00295	ALBASIA FALCATA DOORCORE MRE 40x783x2148	6.7275	FGD00297	FG DOORCORE 40x783x2148	6.7275	GPAK	100	Active	0	FGOD	m3	1.000000
391	FGD00295	ALBASIA FALCATA DOORCORE MRE 40x783x2148	6.7275	PAK00121	PACKING TUMPUK 30	100	GPAK	100	Active	1	GKPP	Set	0.067300
392	FGD00297	FG DOORCORE 40x783x2148	6.7275	WIV00477	VENEER LG 0.85x930x2200	0.3478	FGOD	100	Active	0	GKOP	m3	19.343000
393	FGD00297	FG DOORCORE 40x783x2148	6.7275	WIV00267	VENEER SG 2x930x2300	1.2834	FGOD	100	Active	1	GKOP	m3	5.241900
394	FGD00297	FG DOORCORE 40x783x2148	6.7275	RMB00091	ALBASIA FALCATA BARECORE A 17x783x2148	5.7184	FGOD	100	Active	2	GKOP	m3	1.176500
395	FGD00297	FG DOORCORE 40x783x2148	6.7275	SUP00073	PREMIX UL MRE-1	237.4297	FGOD	100	Active	3	GKOP	Kg	0.028300
396	FGD00305	FG DOORCORE MRE 42x900x2100	7.9380	RMM00012	MDF 2.5x1265x2485	1.5718	FGOD	100	Active	0	GKOP	m3	5.050300
397	FGD00305	FG DOORCORE MRE 42x900x2100	7.9380	RMB00043	ALBASIA FALCATA BARECORE A 10.5x900x2050	3.8746	FGOD	100	Active	1	GKOP	m3	2.048700
398	FGD00305	FG DOORCORE MRE 42x900x2100	7.9380	RMB00073	ALBASIA FALCATA BARECORE A 13 CENTER CORE	2.9003	FGOD	100	Active	2	GKOP	m3	2.737000
399	FGD00305	FG DOORCORE MRE 42x900x2100	7.9380	WIV00023	VENEER SG 2.6x930x2150	1.0398	FGOD	100	Active	3	GKOP	m3	7.634200
400	FGD00305	FG DOORCORE MRE 42x900x2100	7.9380	SUP00079	PREMIX UL MRE-0	237.4297	FGOD	100	Active	4	GKOP	Kg	0.033400
401	FGD00309	FG DOORCORE 35x820x2420	6.9454	WIV00067	VENEER LG 2x930x2440	0.9076	FGOD	100	Active	0	GKOP	m3	7.652500
402	FGD00309	FG DOORCORE 35x820x2420	6.9454	RMB00002	ALBASIA FALCATA BARECORE A 10.5x1220x2440	6.2512	FGOD	100	Active	1	GKOP	m3	1.111100
403	FGD00309	FG DOORCORE 35x820x2420	6.9454	RMB00073	ALBASIA FALCATA BARECORE A 13 CENTER CORE	3.2534	FGOD	100	Active	2	GKOP	m3	2.134800
404	FGD00309	FG DOORCORE 35x820x2420	6.9454	SUP00073	PREMIX UL MRE-1	177.5561	FGOD	100	Active	3	GKOP	Kg	0.039100
405	FGD00310	FG DOORCORE 35x920x2420	7.7924	WIV00067	VENEER LG 2x930x2440	0.9076	FGOD	100	Active	0	GKOP	m3	8.585700
406	FGD00310	FG DOORCORE 35x920x2420	7.7924	RMB00002	ALBASIA FALCATA BARECORE A 10.5x1220x2440	6.2512	FGOD	100	Active	1	GKOP	m3	1.246500
407	FGD00310	FG DOORCORE 35x920x2420	7.7924	RMB00073	ALBASIA FALCATA BARECORE A 13 CENTER CORE	3.2534	FGOD	100	Active	2	GKOP	m3	2.395200
408	FGD00310	FG DOORCORE 35x920x2420	7.7924	SUP00099	PREMIX MRE-0 1020	177.5561	FGOD	100	Active	3	GKOP	Kg	0.043900
409	FGD00318	ALBASIA FALCATA DOORCORE MRE 44x1220x2250	12.0780	FGD00327	FG DOORCORE MRE 44x1220x2250	12.078	GPAK	100	Active	0	FGOD	m3	1.000000
410	FGD00318	ALBASIA FALCATA DOORCORE MRE 44x1220x2250	12.0780	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.120800
411	FGD00322	FG DOORCORE MRE 39x1220x2200	10.4676	WIV00063	VENEER LG 1.3x1220x2200	0.6978	FGOD	100	Active	0	GKOP	m3	15.000900
412	FGD00322	FG DOORCORE MRE 39x1220x2200	10.4676	RMB00018	ALBASIA FALCATA BARECORE A 16x1220x2440	9.5258	FGOD	100	Active	1	GKOP	m3	1.098900
413	FGD00322	FG DOORCORE MRE 39x1220x2200	10.4676	WIV00011	VENEER SG 2x1220x1220	1.7862	FGOD	100	Active	2	GKOP	m3	5.860300
414	FGD00322	FG DOORCORE MRE 39x1220x2200	10.4676	SUP00073	PREMIX UL MRE-1	313.3093	FGOD	100	Active	3	GKOP	Kg	0.033400
415	FGD00329	ALBASIA FALCATA DOORCORE MRE 44x915x2058	8.2855	FGD00347	FG DOORCORE MRE 44x915x2058	8.2855	GPAK	100	Active	0	FGOD	m3	1.000000
416	FGD00329	ALBASIA FALCATA DOORCORE MRE 44x915x2058	8.2855	PAK00140	PACKING TUMPUK 27	100	GPAK	100	Active	1	GKPP	Set	0.082900
417	FGD00334	ALBASIA FALCATA DOORCORE + MDF MRE 42x1220x2440	12.5026	FGD00336	FG DOORCORE MDF 42x1220x2440	12.5026	GPAK	100	Active	0	FGOD	m3	1.000000
418	FGD00334	ALBASIA FALCATA DOORCORE + MDF MRE 42x1220x2440	12.5026	PAK00076	PACKING TUMPUK 100	1	GPAK	100	Active	1	GKPP	Set	12.502600
419	FGD00343	DOORCORE MRE 44x915x2058	8.2855	WIV00046	VENEER LG 1x930x2200	0.4092	PFIN	100	Active	0	GKOP	m3	20.248000
420	FGD00343	DOORCORE MRE 44x915x2058	8.2855	WCD00079	CORE DOORCORE MRE 42x915x2058	7.9089	PFIN	100	Active	1	WIPA	m3	1.047600
421	FGD00343	DOORCORE MRE 44x915x2058	8.2855	SUP00073	PREMIX UL MRE-1	102	PFIN	100	Active	2	GKOP	Kg	0.081200
422	FGD00347	FG DOORCORE MRE 44x915x2058	8.2855	FGD00343	DOORCORE MRE 44x915x2058	8.2855	FGOD	100	Active	0	PFIN	m3	1.000000
423	FGD00357	ALBASIA FALCATA DOORCORE MRE 39.2x1245x2200	10.7369	FGD00365	FG DOORCORE MRE 39.2x1245x2200	10.7369	GPAK	100	Active	0	FGOD	m3	1.000000
424	FGD00357	ALBASIA FALCATA DOORCORE MRE 39.2x1245x2200	10.7369	PAK00121	PACKING TUMPUK 30	100	GPAK	100	Active	1	GKPP	Set	0.107400
425	FGD00363	ALBASIA FALCATA DOORCORE MRE 33x932x2300	7.0739	FGD00368	FG DOORCORE MRE 33x932x2300	7.0739	GPAK	100	Active	0	FGOD	m3	1.000000
426	FGD00363	ALBASIA FALCATA DOORCORE MRE 33x932x2300	7.0739	PAK00118	PACKING TUMPUK 34	100	GPAK	100	Active	1	GKPP	Set	0.070700
427	FGD00366	DOORCORE MRE 33x932x2300	7.0739	WIV00553	VENEER LG 1x930x2500	0.465	PFIN	100	Active	0	GKOP	m3	15.212700
428	FGD00366	DOORCORE MRE 33x932x2300	7.0739	WCD00083	CORE DOORCORE MRE 31x932x2300	6.6452	PFIN	100	Active	1	WIPA	m3	1.064500
429	FGD00366	DOORCORE MRE 33x932x2300	7.0739	SUP00073	PREMIX UL MRE-1	102.5	PFIN	100	Active	2	GKOP	Kg	0.069000
430	FGD00366	DOORCORE MRE 33x932x2300	7.0739	SUP00005	LEM PROTECTA C-3, BC 23	0.01	PFIN	100	Active	3	SUPP	kg	707.390000
431	FGD00367	ALBASIA FALCATA DOORCORE MRE 38x932x2300	8.1457	FGD00377	FG DOORCORE MRE 38x932x2300	8.1457	GPAK	100	Active	0	FGOD	m3	1.000000
432	FGD00367	ALBASIA FALCATA DOORCORE MRE 38x932x2300	8.1457	PAK00121	PACKING TUMPUK 30	100	GPAK	100	Active	1	GKPP	Set	0.081500
433	FGD00368	FG DOORCORE MRE 33x932x2300	7.0739	FGD00366	DOORCORE MRE 33x932x2300	7.0739	FGOD	100	Active	0	PFIN	m3	1.000000
434	FGD00372	ALBASIA FALCATA DOORCORE MRE 27.6x932x2300	5.9163	FGD00376	FG DOORCORE MRE 27.6x932x2300	5.9163	GPAK	100	Active	0	FGOD	m3	1.000000
435	FGD00372	ALBASIA FALCATA DOORCORE MRE 27.6x932x2300	5.9163	PAK00112	PACKING TUMPUK 41	100	GPAK	100	Active	1	GKPP	Set	0.059200
436	FGD00374	DOORCORE MRE 38x932x2300	8.1457	WIV00571	VENEER SG 1.3x930x2300	0.5562	PFIN	100	Active	0	GKOP	m3	14.645300
437	FGD00374	DOORCORE MRE 38x932x2300	8.1457	WCD00084	CORE DOORCORE MRE 36x932x2300	7.717	PFIN	100	Active	1	WIPA	m3	1.055600
438	FGD00374	DOORCORE MRE 38x932x2300	8.1457	SUP00073	PREMIX UL MRE-1	102	PFIN	100	Active	2	GKOP	Kg	0.079900
439	FGD00375	DOORCORE MRE 27.6x932x2300	5.9163	WIV00376	VENEER SG 1.3x930x2440	0.59	PFIN	100	Active	0	GKOP	m3	10.027600
440	FGD00375	DOORCORE MRE 27.6x932x2300	5.9163	WCD00117	CORE DOORCORE MRE 26x932x2300	5.5734	PFIN	100	Active	1	WIPA	m3	1.061500
441	FGD00375	DOORCORE MRE 27.6x932x2300	5.9163	SUP00073	PREMIX UL MRE-1	82.5	PFIN	100	Active	2	GKOP	Kg	0.071700
442	FGD00375	DOORCORE MRE 27.6x932x2300	5.9163	SUP00005	LEM PROTECTA C-3, BC 23	0.01	PFIN	100	Active	3	GKOP	kg	591.630000
443	FGD00375	DOORCORE MRE 27.6x932x2300	5.9163	BTK-ASM	BTK COSTING ASSEMBLY	100	PFIN	100	Active	4	GKOP	Ply	0.059200
444	FGD00375	DOORCORE MRE 27.6x932x2300	5.9163	BTK-ASM-FINH	BTK COSTING ASSEMBLY-FINH DEMPUL/REVISI	100	PFIN	100	Active	5	GKOP	Ply	0.059200
445	FGD00375	DOORCORE MRE 27.6x932x2300	5.9163	BTK-ASM-QC	BTK COSTING ASSEMBLY-QC	100	PFIN	100	Active	6	GKOP	Ply	0.059200
446	FGD00375	DOORCORE MRE 27.6x932x2300	5.9163	BTK-ASM-TEKN	BTK COSTING ASSEMBLY-TEKNIK	100	PFIN	100	Active	7	GKOP	Ply	0.059200
447	FGD00375	DOORCORE MRE 27.6x932x2300	5.9163	LST-ASM	LISTRIK ASSEMBLY	100	PFIN	100	Active	8	GKOP	Ply	0.059200
448	FGD00376	FG DOORCORE MRE 27.6x932x2300	5.9163	FGD00375	DOORCORE MRE 27.6x932x2300	5.9163	FGOD	100	Active	0	PFIN	m3	1.000000
449	FGD00377	FG DOORCORE MRE 38x932x2300	8.1457	FGD00374	DOORCORE MRE 38x932x2300	8.1457	FGOD	100	Active	0	PFIN	m3	1.000000
450	FGD00384	ALBASIA FALCATA DOORCORE MRE 30x932x2300	6.4308	FGD00391	FG DOORCORE MRE 30x932x2300	6.4308	GPAK	100	Active	0	FGOD	m3	1.000000
451	FGD00384	ALBASIA FALCATA DOORCORE MRE 30x932x2300	6.4308	PAK00115	PACKING TUMPUK 36	100	GPAK	100	Active	1	GKPP	Set	0.064300
452	FGD00385	ALBASIA FALCATA DOORCORE MRE 50x932x2300	10.7180	FGD00392	FG DOORCORE 50X932X2300	10.718	GPAK	100	Active	0	FGOD	m3	1.000000
453	FGD00385	ALBASIA FALCATA DOORCORE MRE 50x932x2300	10.7180	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.107200
454	FGD00386	DOORCORE MRE 30x932x2300	6.4308	WIV00267	VENEER SG 2x930x2300	0.8556	PFIN	100	Active	0	GKOP	m3	7.516100
455	FGD00386	DOORCORE MRE 30x932x2300	6.4308	WCD00086	CORE DOORCORE MRE 28x932x2300	6.0021	PFIN	100	Active	1	WIPA	m3	1.071400
456	FGD00386	DOORCORE MRE 30x932x2300	6.4308	SUP00073	PREMIX UL MRE-1	102.5	PFIN	100	Active	2	GKOP	Kg	0.062700
457	FGD00386	DOORCORE MRE 30x932x2300	6.4308	SUP00005	LEM PROTECTA C-3, BC 23	0.05	PFIN	100	Active	3	GKOP	kg	128.616000
458	FGD00387	ALBASIA FALCATA DOORCORE MRE 35x830x2420	7.0301	FGD00406	FG DOORCORE MRE 35x830x2420	7.0301	GPAK	100	Active	0	FGOD	m3	1.000000
459	FGD00387	ALBASIA FALCATA DOORCORE MRE 35x830x2420	7.0301	PAK00083	PACKING TUMPUK 31	100	GPAK	100	Active	1	GKPP	Set	0.070300
460	FGD00388	ALBASIA FALCATA DOORCORE MRE 35x830x2200	6.3910	FGD00407	FG DOORCORE MRE 35x830x2200	6.391	GPAK	100	Active	0	FGOD	m3	1.000000
461	FGD00388	ALBASIA FALCATA DOORCORE MRE 35x830x2200	6.3910	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.063900
462	FGD00391	FG DOORCORE MRE 30x932x2300	6.4308	FGD00386	DOORCORE MRE 30x932x2300	6.4308	FGOD	100	Active	0	PFIN	m3	1.000000
463	FGD00399	DOORCORE MRE 35x830x2200	6.3910	WIV00061	VENEER LG 1.3x930x2200	0.532	PFIN	100	Active	0	GKOP	m3	12.013200
464	FGD00399	DOORCORE MRE 35x830x2200	6.3910	WCD00089	CORE DOORCORE MRE 33x830x2200	6.0258	PFIN	100	Active	1	WIPA	m3	1.060600
465	FGD00399	DOORCORE MRE 35x830x2200	6.3910	SUP00073	PREMIX UL MRE-1	102.5	PFIN	100	Active	2	GKOP	Kg	0.062400
466	FGD00406	FG DOORCORE MRE 35x830x2420	7.0301	WIV00553	VENEER LG 1x930x2500	0.465	FGOD	100	Active	0	GKOP	m3	15.118500
467	FGD00406	FG DOORCORE MRE 35x830x2420	7.0301	RMB00111	ALBASIA FALCATA BARECORE A 10.5x830x2420	4.218	FGOD	100	Active	1	GKOP	m3	1.666700
468	FGD00406	FG DOORCORE MRE 35x830x2420	7.0301	RMB00073	ALBASIA FALCATA BARECORE A 13 CENTER CORE	2.6112	FGOD	100	Active	2	GKOP	m3	2.692300
469	FGD00406	FG DOORCORE MRE 35x830x2420	7.0301	SUP00073	PREMIX UL MRE-1	205	FGOD	100	Active	3	GKOP	Kg	0.034300
470	FGD00407	FG DOORCORE MRE 35x830x2200	6.3910	FGD00399	DOORCORE MRE 35x830x2200	6.391	FGOD	100	Active	0	PFIN	m3	1.000000
471	FGD00436	FG DOORCORE RECONSTITUTED MRE 44x915x2135	8.5955	RMV00063	VENEER BELI LG RECONSTITUTED POPLAR 1x1280x2500	0.64	FGOD	100	Active	0	GKOP	m3	13.430500
472	FGD00436	FG DOORCORE RECONSTITUTED MRE 44x915x2135	8.5955	WIV00008	VENEER SG 2x930x2150	1.1997	FGOD	100	Active	1	GKOP	m3	7.164700
473	FGD00436	FG DOORCORE RECONSTITUTED MRE 44x915x2135	8.5955	RMB00029	ALBASIA FALCATA BARECORE A 18.7x915x2135	7.3062	FGOD	100	Active	2	GKOP	m3	1.176500
474	FGD00436	FG DOORCORE RECONSTITUTED MRE 44x915x2135	8.5955	SUP00073	PREMIX UL MRE-1	237.4297	FGOD	100	Active	3	GKOP	Kg	0.036200
475	FGD00440	ALBASIA FALCATA DOORCORE RECONSTITUTED MRE 44x1220x2440	13.0979	FGD00450	FG DOORCORE RECONSTITUTED MRE 44x1220x2440	13.0979	GPAK	100	Active	0	FGOD	m3	1.000000
476	FGD00440	ALBASIA FALCATA DOORCORE RECONSTITUTED MRE 44x1220x2440	13.0979	PAK00140	PACKING TUMPUK 27	100	GPAK	100	Active	1	GKPP	Set	0.131000
477	FGD00441	DOORCORE RECONSTITUTED MRE 44x1220x2440	13.0979	RMV00063	VENEER BELI LG RECONSTITUTED POPLAR 1x1280x2500	0.64	PFIN	100	Active	0	GKOP	m3	20.465500
478	FGD00441	DOORCORE RECONSTITUTED MRE 44x1220x2440	13.0979	WCD00115	CORE DOORCORE RECONSTITUTED MRE 42x1220x2440	12.5026	PFIN	100	Active	1	WIPA	m3	1.047600
479	FGD00441	DOORCORE RECONSTITUTED MRE 44x1220x2440	13.0979	SUP00073	PREMIX UL MRE-1	110	PFIN	100	Active	2	GKOP	Kg	0.119100
480	FGD00450	FG DOORCORE RECONSTITUTED MRE 44x1220x2440	13.0979	FGD00441	DOORCORE RECONSTITUTED MRE 44x1220x2440	13.0979	FGOD	100	Active	0	PFIN	m3	1.000000
481	FGD00452	ALBASIA FALCATA DOORCORE MRE 34.9x1220x2032	8.6518	FGD00455	FG DOORCORE MRE 34.9x1220x2032	8.6518	GPAK	100	Active	0	FGOD	m3	1.000000
482	FGD00452	ALBASIA FALCATA DOORCORE MRE 34.9x1220x2032	8.6518	PAK00112	PACKING TUMPUK 41	100	GPAK	100	Active	1	GKPP	Set	0.086500
483	FGD00453	ALBASIA FALCATA DOORCORE MRE 34.9x1245x2032	8.8291	FGD00460	FG DOORCORE MRE 34.9x1245x2032	8.8291	GPAK	100	Active	0	FGOD	m3	1.000000
484	FGD00453	ALBASIA FALCATA DOORCORE MRE 34.9x1245x2032	8.8291	PAK00112	PACKING TUMPUK 41	100	GPAK	100	Active	1	GKPP	Set	0.088300
485	FGD00466	ALBASIA FALCATA DOORCORE WBP 57.2x1232x2451	17.2723	FGD00473	FG DOORCORE WBP 57.2x1232x2451	17.2723	GPAK	100	Active	0	FGOD	m3	1.000000
486	FGD00466	ALBASIA FALCATA DOORCORE WBP 57.2x1232x2451	17.2723	PAK00135	PACKING BERDIRI 57	100	GPAK	100	Active	1	GKPP	Set	0.172700
487	FGD00467	ALBASIA FALCATA DOORCORE WBP 38.1x1232x2451	11.5048	FGD00471	FG DOORCORE WBP 38.1x1232x2451	11.5048	GPAK	100	Active	0	FGOD	m3	1.000000
488	FGD00467	ALBASIA FALCATA DOORCORE WBP 38.1x1232x2451	11.5048	PAK00074	PACKING TUMPUK 210	100	GPAK	100	Active	1	GKPP	Set	0.115000
489	FGD00484	ALBASIA FALCATA DOORCORE MRE 30x1100x2400	7.9200	FGD00506	FG DOORCORE MRE 30x1100x2400	7.92	GPAK	100	Active	0	FGOD	m3	1.000000
490	FGD00484	ALBASIA FALCATA DOORCORE MRE 30x1100x2400	7.9200	PAK00115	PACKING TUMPUK 36	100	GPAK	100	Active	1	GKPP	Set	0.079200
491	FGD00487	ALBASIA FALCATA DOORCORE WBP 39.4x854x1911	6.4301	FGD00489	FG DOORCORE WBP 39.4x854x1911	6.4301	GPAK	100	Active	0	FGOD	m3	1.000000
492	FGD00487	ALBASIA FALCATA DOORCORE WBP 39.4x854x1911	6.4301	PAK00081	PACKING TUMPUK 34 LOKAL	100	GPAK	100	Active	1	GKPP	Set	0.064300
493	FGD00495	ALBASIA FALCATA DOORCORE WBP 32x1232x2451	9.6628	FGD00504	FG DOORCORE WBP 32x1232x2451	9.6628	GPAK	100	Active	0	FGOD	m3	1.000000
494	FGD00495	ALBASIA FALCATA DOORCORE WBP 32x1232x2451	9.6628	PAK00077	PACKING TUMPUK 80	100	GPAK	100	Active	1	GKPP	Set	0.096600
495	FGD00496	DOORCORE MRE 33x920x2150	6.5274	WIV00008	VENEER SG 2x930x2150	0.7998	PFIN	100	Active	0	GKOP	m3	8.161300
496	FGD00496	DOORCORE MRE 33x920x2150	6.5274	WCD00108	CORE DOORCORE MRE 30x920x2150	5.934	PFIN	100	Active	1	WIPA	m3	1.100000
497	FGD00496	DOORCORE MRE 33x920x2150	6.5274	SUP00073	PREMIX UL MRE-1	102.5	PFIN	100	Active	2	GKOP	Kg	0.063700
498	FGD00497	FG DOORCORE MRE 33x920x2150	6.5274	FGD00496	DOORCORE MRE 33x920x2150	6.5274	FGOD	100	Active	0	PFIN	m3	1.000000
499	FGD00504	FG DOORCORE WBP 32x1232x2451	9.6628	WIV00434	VENEER SG 1.7x1220x2440	1.0122	FGOD	100	Active	0	GKOP	m3	9.546300
500	FGD00504	FG DOORCORE WBP 32x1232x2451	9.6628	RMB00002	ALBASIA FALCATA BARECORE A 10.5x1220x2440	6.2512	FGOD	100	Active	1	GKOP	m3	1.545800
501	FGD00504	FG DOORCORE WBP 32x1232x2451	9.6628	RMB00072	ALBASIA FALCATA BARECORE A 10.5 CENTER CORE	3.12564	FGOD	100	Active	2	GKOP	m3	3.091500
502	FGD00504	FG DOORCORE WBP 32x1232x2451	9.6628	SUP00075	PREMIX BONDTITE	198	FGOD	100	Active	3	GKOP	Kg	0.048800
503	FGD00505	DOORCORE MRE 30x1100x2400	7.9200	WIV00015	VENEER SG 2x1220x2440	1.1908	PFIN	100	Active	0	GKOP	m3	6.651000
504	FGD00505	DOORCORE MRE 30x1100x2400	7.9200	WCD00109	CORE DOORCORE MRE 26x1100x2400	6.864	PFIN	100	Active	1	WIPA	m3	1.153800
505	FGD00505	DOORCORE MRE 30x1100x2400	7.9200	SUP00073	PREMIX UL MRE-1	102.5	PFIN	100	Active	2	GKOP	Kg	0.077300
506	FGD00506	FG DOORCORE MRE 30x1100x2400	7.9200	FGD00505	DOORCORE MRE 30x1100x2400	7.92	FGOD	100	Active	0	PFIN	m3	1.000000
507	FGD00510	FG DOORCORE MRE 35x920x2420	7.7924	WIV00553	VENEER LG 1x930x2500	0.465	FGOD	100	Active	0	GKOP	m3	16.757800
508	FGD00510	FG DOORCORE MRE 35x920x2420	7.7924	RMB00137	ALBASIA FALCATA BARECORE A 10.5x920x2420	4.6754	FGOD	100	Active	1	GKOP	m3	1.666700
509	FGD00510	FG DOORCORE MRE 35x920x2420	7.7924	RMB00073	ALBASIA FALCATA BARECORE A 13 CENTER CORE	1	FGOD	100	Active	2	GKOP	m3	7.792400
510	FGD00510	FG DOORCORE MRE 35x920x2420	7.7924	SUP00073	PREMIX UL MRE-1	205	FGOD	100	Active	3	GKOP	Kg	0.038000
511	FGD00512	ALBASIA FALCATA DOORCORE WBP 44x1232x2451	13.2864	FGD00245	FG DOORCORE WBP 44x1232x2451	13.2864	GPAK	100	Active	0	FGOD	m3	1.000000
512	FGD00512	ALBASIA FALCATA DOORCORE WBP 44x1232x2451	13.2864	PAK00076	PACKING TUMPUK 100	100	GPAK	100	Active	1	GKPP	Set	0.132900
513	FGD00513	ALBASIA FALCATA DOORCORE MRE 54x850x2000	9.1800	FGD00514	FG DOORCORE MRE 54x850x2000	9.18	GPAK	100	Active	0	FGOD	m3	1.000000
514	FGD00513	ALBASIA FALCATA DOORCORE MRE 54x850x2000	9.1800	PAK00076	PACKING TUMPUK 100	100	GPAK	100	Active	1	GKOP	Set	0.091800
515	FGD00514	FG DOORCORE MRE 54x850x2000	9.1800	WIV00613	VENEER LG 1x1220x2200	0.5368	FGOD	100	Active	0	GKOP	m3	17.101300
516	FGD00514	FG DOORCORE MRE 54x850x2000	9.1800	WIV00008	VENEER SG 2x930x2150	0.7998	FGOD	100	Active	1	GKOP	m3	11.477900
517	FGD00514	FG DOORCORE MRE 54x850x2000	9.1800	RMB00138	ALBASIA FALCATA BARECORE A 16.4x850x2000	5.576	FGOD	100	Active	2	GKOP	m3	1.646300
518	FGD00514	FG DOORCORE MRE 54x850x2000	9.1800	RMB00110	ALBASIA FALCATA BARECORE A 16 CENTER CORE	2.788	FGOD	100	Active	3	GKOP	m3	3.292700
519	FGD00514	FG DOORCORE MRE 54x850x2000	9.1800	SUP00099	PREMIX MRE-0 1020	307.5	FGOD	100	Active	4	GKOP	Kg	0.029900
520	FGD00515	ALBASIA FALCATA DOORCORE MRE 54x915x2135	10.5490	FGD00516	FG DOORCORE MRE 54x915x2135	10.549	GPAK	100	Active	0	FGOD	m3	1.000000
521	FGD00515	ALBASIA FALCATA DOORCORE MRE 54x915x2135	10.5490	PAK00076	PACKING TUMPUK 100	100	GPAK	100	Active	1	GKPP	Set	0.105500
522	FGD00516	FG DOORCORE MRE 54x915x2135	10.5490	WIV00046	VENEER LG 1x930x2200	0.4092	FGOD	100	Active	0	GKOP	m3	25.779600
523	FGD00516	FG DOORCORE MRE 54x915x2135	10.5490	WIV00008	VENEER SG 2x930x2150	0.7998	FGOD	100	Active	1	GKOP	m3	13.189500
524	FGD00516	FG DOORCORE MRE 54x915x2135	10.5490	RMB00141	ALBASIA FALCATA BARECORE A 16.4x915x2135	6.4076	FGOD	100	Active	2	GKOP	m3	1.646300
525	FGD00516	FG DOORCORE MRE 54x915x2135	10.5490	RMB00110	ALBASIA FALCATA BARECORE A 16 CENTER CORE	3.12564	FGOD	100	Active	3	GKOP	m3	3.375000
526	FGD00516	FG DOORCORE MRE 54x915x2135	10.5490	SUP00079	PREMIX UL MRE-0	375	FGOD	100	Active	4	GKOP	Kg	0.028100
527	FGD00518	ALBASIA FALCATA DOORCORE MRE 33x1220x2440	9.8234	FGD00519	FG DOORCORE MRE 33x1220x2440	9.8234	GPAK	100	Active	0	FGOD	m3	1.000000
528	FGD00518	ALBASIA FALCATA DOORCORE MRE 33x1220x2440	9.8234	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.098200
529	FGD00519	FG DOORCORE MRE 33x1220x2440	9.8234	FGD00530	DOORCORE MRE 33x1220x2440	9.8234	FGOD	100	Active	0	PFIN	m3	1.000000
530	FGD00521	ALBASIA FALCATA DOORCORE FJLC MRE 44x1220x3048	16.3617	FGD00524	FG DOORCORE FJLC MRE 44x1220x3048	16.3617	GPAK	100	Active	0	FGOD	m3	1.000000
531	FGD00521	ALBASIA FALCATA DOORCORE FJLC MRE 44x1220x3048	16.3617	PAK00109	PACKING TUMPUK 49	100	GPAK	100	Active	1	GKPP	Set	0.163600
532	FGD00522	FG DOORCORE MRE 44x1232x2451	13.2864	FGD00523	DOORCORE MRE 44x1232x2451	13.2864	FGOD	100	Active	0	PFIN	m3	1.000000
533	FGD00523	DOORCORE MRE 44x1232x2451	13.2864	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	21.781000
534	FGD00523	DOORCORE MRE 44x1232x2451	13.2864	WCD00110	CORE DOORCORE MRE 42x1232x2451	12.6825	PFIN	100	Active	1	WIPA	m3	1.047600
535	FGD00523	DOORCORE MRE 44x1232x2451	13.2864	SUP00099	PREMIX MRE-0 1020	120	PFIN	100	Active	2	GKOP	Kg	0.110700
536	FGD00524	FG DOORCORE FJLC MRE 44x1220x3048	16.3617	FGD00525	DOORCORE FJLC MRE 44x1220x3048	16.3617	FGOD	100	Active	0	PFIN	m3	1.000000
537	FGD00525	DOORCORE FJLC MRE 44x1220x3048	16.3617	WIV00404	VENEER SG 2x1220x3100	1.5128	PFIN	100	Active	0	GKOP	m3	10.815500
538	FGD00525	DOORCORE FJLC MRE 44x1220x3048	16.3617	WCD00111	CORE DOORCORE FJLC MRE 42x1220x3048	15.618	PFIN	100	Active	1	WIPA	m3	1.047600
539	FGD00525	DOORCORE FJLC MRE 44x1220x3048	16.3617	SUP00099	PREMIX MRE-0 1020	130	PFIN	100	Active	2	GKOP	Kg	0.125900
540	FGD00526	ALBASIA FALCATA DOORCORE RECONSTITUTED MRE 33x1220x2440	9.8234	FGD00537	FG DOORCORE RECONSTITUTED MRE 33x1220x2440	9.8234	GPAK	100	Active	0	FGOD	m3	1.000000
541	FGD00526	ALBASIA FALCATA DOORCORE RECONSTITUTED MRE 33x1220x2440	9.8234	PAK00123	PACKING BERDIRI 30	100	GPAK	100	Active	1	GKPP	Set	0.098200
542	FGD00527	ALBASIA FALCATA DOORCORE FJLC MRE 44x1232x3061	16.5931	FGD00528	FG DOORCORE FJLC MRE 44x1232x3061	16.5931	GPAK	100	Active	0	FGOD	m3	1.000000
543	FGD00527	ALBASIA FALCATA DOORCORE FJLC MRE 44x1232x3061	16.5931	PAK00140	PACKING TUMPUK 27	100	GPAK	100	Active	1	GKOP	Set	0.165900
544	FGD00528	FG DOORCORE FJLC MRE 44x1232x3061	16.5931	FGD00529	DOORCORE FJLC MRE 44x1232x3061	16.5931	FGOD	100	Active	0	PFIN	m3	1.000000
545	FGD00529	DOORCORE FJLC MRE 44x1232x3061	16.5931	WIV00404	VENEER SG 2x1220x3100	1.5128	PFIN	100	Active	0	GKOP	m3	10.968500
546	FGD00529	DOORCORE FJLC MRE 44x1232x3061	16.5931	WCD00114	CORE DOORCORE FJLC MRE 42x1232x3061	15.8388	PFIN	100	Active	1	WIPA	m3	1.047600
547	FGD00529	DOORCORE FJLC MRE 44x1232x3061	16.5931	SUP00093	LEM HENKEL AQUENCE SL 8460 BC, 4.0	99	PFIN	100	Active	2	GKOP	kg	0.167600
548	FGD00529	DOORCORE FJLC MRE 44x1232x3061	16.5931	SUP00094	HARDENER HENKEL CATALYST 72-7357 M BC, 4.0	10	PFIN	100	Active	3	GKOP	kg	1.659300
549	FGD00530	DOORCORE MRE 33x1220x2440	9.8234	WIV00015	VENEER SG 2x1220x2440	1.1908	PFIN	100	Active	0	GKOP	m3	8.249400
550	FGD00530	DOORCORE MRE 33x1220x2440	9.8234	WCD00005	CORE DOORCORE MRE 30x1220x2440	8.9304	PFIN	100	Active	1	WIPA	m3	1.100000
551	FGD00530	DOORCORE MRE 33x1220x2440	9.8234	SUP00073	PREMIX UL MRE-1	102.5	PFIN	100	Active	2	SUPP	Kg	0.095800
552	FGD00531	ALBASIA FALCATA DOORCORE MRE 3 LAYER 40x915x2135	7.8141	FGD00532	FG DOORCORE MRE 3 LAYER 40x915x2135	7.8141	GPAK	100	Active	0	FGOD	m3	1.000000
553	FGD00531	ALBASIA FALCATA DOORCORE MRE 3 LAYER 40x915x2135	7.8141	PAK00142	PACKING TUMPUK 3x7 DC 27	100	GPAK	100	Active	1	GKPP	Set	0.078100
554	FGD00532	FG DOORCORE MRE 3 LAYER 40x915x2135	7.8141	FGD00533	DOORCORE MRE 3 LAYER 40x915x2135	7.8141	FGOD	100	Active	0	PFIN	m3	1.000000
555	FGD00533	DOORCORE MRE 3 LAYER 40x915x2135	7.8141	WIV00530	VENEER LG 1.3x1220x2500	0.793	PFIN	100	Active	0	GKOP	m3	9.853800
556	FGD00533	DOORCORE MRE 3 LAYER 40x915x2135	7.8141	WCD00118	CORE DOORCORE MRE 3 LAYER 38x915x2135	7.4234	PFIN	100	Active	1	WIPA	m3	1.052600
557	FGD00533	DOORCORE MRE 3 LAYER 40x915x2135	7.8141	SUP00073	PREMIX UL MRE-1	76.875	PFIN	100	Active	2	GKOP	Kg	0.101600
558	FGD00534	ALBASIA FALCATA DOORCORE 3 LAYER MRE 44x1220x2440	13.0979	FGD00535	FG DOORCORE 3 LAYER MRE 44x1220x2440	13.0979	GPAK	100	Active	0	FGOD	m3	1.000000
559	FGD00534	ALBASIA FALCATA DOORCORE 3 LAYER MRE 44x1220x2440	13.0979	PAK00112	PACKING TUMPUK 41	100	GPAK	100	Active	1	GKPP	Set	0.131000
560	FGD00535	FG DOORCORE 3 LAYER MRE 44x1220x2440	13.0979	FGD00536	DOORCORE 3 LAYER MRE 44x1220x2440	13.0979	FGOD	100	Active	0	PFIN	m3	1.000000
561	FGD00536	DOORCORE 3 LAYER MRE 44x1220x2440	13.0979	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	21.472000
562	FGD00536	DOORCORE 3 LAYER MRE 44x1220x2440	13.0979	WCD00119	CORE DOORCORE MRE 3 LAYER 42x1220x2440	12.5026	PFIN	100	Active	1	WIPA	m3	1.047600
563	FGD00536	DOORCORE 3 LAYER MRE 44x1220x2440	13.0979	SUP00073	PREMIX UL MRE-1	105.9	PFIN	100	Active	2	GKOP	Kg	0.123700
564	FGD00537	FG DOORCORE RECONSTITUTED MRE 33x1220x2440	9.8234	FGD00538	DOORCORE RECONSTITUTED MRE 33x1220x2440	9.8234	FGOD	100	Active	0	PFIN	m3	1.000000
565	FGD00538	DOORCORE RECONSTITUTED MRE 33x1220x2440	9.8234	RMV00063	VENEER BELI LG RECONSTITUTED POPLAR 1x1280x2500	0.64	PFIN	100	Active	0	WADA	m3	15.349100
566	FGD00538	DOORCORE RECONSTITUTED MRE 33x1220x2440	9.8234	WCD00121	CORE DOORCORE RECONSTITUTED MRE 30x1220x2440	8.9304	PFIN	100	Active	1	WIPA	m3	1.100000
567	FGD00538	DOORCORE RECONSTITUTED MRE 33x1220x2440	9.8234	SUP00073	PREMIX UL MRE-1	110	PFIN	100	Active	2	GKOP	Kg	0.089300
568	FGD00542	ALBASIA FALCATA DOORCORE MRE 32x1232x2451	9.6628	FGD00543	FG DOORCORE MRE 32x1232x2451	9.6628	GPAK	100	Active	0	FGOD	m3	1.000000
569	FGD00542	ALBASIA FALCATA DOORCORE MRE 32x1232x2451	9.6628	PAK00118	PACKING TUMPUK 34	100	GPAK	100	Active	1	GKPP	Set	0.096600
570	FGD00543	FG DOORCORE MRE 32x1232x2451	9.6628	FGD00544	DOORCORE MRE 32x1232x2451	9.6628	FGOD	100	Active	0	PFIN	m3	1.000000
571	FGD00544	DOORCORE MRE 32x1232x2451	9.6628	WIV00015	VENEER SG 2x1220x2440	1.1908	PFIN	100	Active	0	GKOP	m3	8.114500
572	FGD00544	DOORCORE MRE 32x1232x2451	9.6628	WCD00122	CORE DOORCORE MRE 30x1232x2451	9.0589	PFIN	100	Active	1	WIPA	m3	1.066700
573	FGD00544	DOORCORE MRE 32x1232x2451	9.6628	SUP00099	PREMIX MRE-0 1020	110	PFIN	100	Active	2	GKOP	Kg	0.087800
574	FGD00546	ALBASIA FALCATA DOORCORE MRE 25x932x2300	5.3590	FGD00549	FG DOORCORE MRE 25x932x2300	5.359	GPAK	100	Active	0	FGOD	m3	1.000000
575	FGD00546	ALBASIA FALCATA DOORCORE MRE 25x932x2300	5.3590	PAK00080	PACKING TUMPUK 42	100	GPAK	100	Active	1	GKPP	Set	0.053600
576	FGD00547	ALBASIA FALCATA DOORCORE RECONSTITUTED MRE 54x915x2135	10.5490	FGD00551	FG DOORCORE RECONSTITUTED MRE 54x915x2135	10.549	GPAK	100	Active	0	FGOD	m3	1.000000
577	FGD00547	ALBASIA FALCATA DOORCORE RECONSTITUTED MRE 54x915x2135	10.5490	PAK00142	PACKING TUMPUK 3x7 DC 27	100	GPAK	100	Active	1	SUPP	Set	0.105500
578	FGD00548	ALBASIA FALCATA DOORCORE RECONSTITUTED MRE 54x838x2040	9.2314	FGD00553	FG DOORCORE RECONSTITUTED MRE 54x838x2040	9.2314	GPAK	100	Active	0	FGOD	m3	1.000000
579	FGD00548	ALBASIA FALCATA DOORCORE RECONSTITUTED MRE 54x838x2040	9.2314	PAK00083	PACKING TUMPUK 31	100	GPAK	100	Active	1	SUPP	Set	0.092300
580	FGD00549	FG DOORCORE MRE 25x932x2300	5.3590	FGD00550	DOORCORE MRE 25x932x2300	5.359	FGOD	100	Active	0	PFIN	m3	1.000000
581	FGD00550	DOORCORE MRE 25x932x2300	5.3590	WIV00267	VENEER SG 2x930x2300	0.8556	PFIN	100	Active	0	GKOP	m3	6.263400
582	FGD00550	DOORCORE MRE 25x932x2300	5.3590	WCD00124	CORE DOORCORE MRE 23x932x2300	4.9303	PFIN	100	Active	1	WIPA	m3	1.087000
583	FGD00550	DOORCORE MRE 25x932x2300	5.3590	SUP00073	PREMIX UL MRE-1	105.9	PFIN	100	Active	2	GKOP	Kg	0.050600
584	FGD00550	DOORCORE MRE 25x932x2300	5.3590	SUP00005	LEM PROTECTA C-3, BC 23	0.0001	PFIN	100	Active	3	GKOP	kg	53590.000000
585	FGD00551	FG DOORCORE RECONSTITUTED MRE 54x915x2135	10.5490	FGD00552	DOORCORE RECONSTITUTED MRE 54x915x2135	10.549	FGOD	100	Active	0	PFIN	m3	1.000000
586	FGD00552	DOORCORE RECONSTITUTED MRE 54x915x2135	10.5490	WIV00046	VENEER LG 1x930x2200	0.4092	PFIN	100	Active	0	GKOP	m3	25.779600
587	FGD00552	DOORCORE RECONSTITUTED MRE 54x915x2135	10.5490	WCD00125	CORE DOORCORE RECONSTITUTED MRE 52x915x2135	10.1583	PFIN	100	Active	1	WIPA	m3	1.038500
588	FGD00552	DOORCORE RECONSTITUTED MRE 54x915x2135	10.5490	SUP00073	PREMIX UL MRE-1	105.9	PFIN	100	Active	2	GKOP	Kg	0.099600
589	FGD00552	DOORCORE RECONSTITUTED MRE 54x915x2135	10.5490	BTK-ASM	BTK COSTING ASSEMBLY	100	PFIN	100	Active	3	GKOP	Ply	0.105500
590	FGD00553	FG DOORCORE RECONSTITUTED MRE 54x838x2040	9.2314	FGD00554	DOORCORE RECONSTITUTED MRE 54x838x2040	9.2314	FGOD	100	Active	0	PFIN	m3	1.000000
591	FGD00554	DOORCORE RECONSTITUTED MRE 54x838x2040	9.2314	RMV00068	VENEER BELI LG RECONSTITUTED POPLAR 1x930x2200	0.4092	PFIN	100	Active	0	GKOP	m3	22.559600
592	FGD00554	DOORCORE RECONSTITUTED MRE 54x838x2040	9.2314	WCD00126	CORE DOORCORE RECONSTITUTED MRE 52x838x2040	8.8895	PFIN	100	Active	1	WIPA	m3	1.038500
593	FGD00554	DOORCORE RECONSTITUTED MRE 54x838x2040	9.2314	SUP00073	PREMIX UL MRE-1	105.9	PFIN	100	Active	2	GKOP	Kg	0.087200
594	FGF00016	ALBASIA FALCATA FINGER JOINT 18x1220x3048	6.6934	RMF00016	FINGER JOINT 18x1220x3048	3.5722	GPAK	100	Active	0	FGOD	m3	1.873700
595	FGF00016	ALBASIA FALCATA FINGER JOINT 18x1220x3048	6.6934	PAK00077	PACKING TUMPUK 80	100	GPAK	100	Active	1	FGOD	Set	0.066900
596	FGF00016	ALBASIA FALCATA FINGER JOINT 18x1220x3048	6.6934	BTK-COSTING PACKING	BTK Simulasi Costing Packing	100	GPAK	100	Active	2	GKPP	Person	0.066900
597	FGF00032	ALBASIA FALCATA FINGER JOINT 18x1232x2451	5.4353	RMF00041	FINGER JOINT 18x1232x2451	5.4353	GPAK	100	Active	0	FGOD	m3	1.000000
598	FGF00032	ALBASIA FALCATA FINGER JOINT 18x1232x2451	5.4353	PAK00077	PACKING TUMPUK 80	100	GPAK	100	Active	1	GKPP	Set	0.054400
599	FGF00033	ALBASIA FALCATA FINGER JOINT 19.1x64x4877	0.5962	RMF00059	FINGER JOINT 19.1x64x4877	0.5962	GPAK	100	Active	0	FGOD	m3	1.000000
600	FGF00033	ALBASIA FALCATA FINGER JOINT 19.1x64x4877	0.5962	PAK00084	PACKING TUMPUK 29	100	GPAK	100	Active	1	GKPP	Set	0.006000
601	FGF00034	ALBASIA FALCATA FINGER JOINT 19.1x89x4877	0.8290	RMF00060	FINGER JOINT 19.1x89x4877	0.829	GPAK	100	Active	0	FGOD	m3	1.000000
602	FGF00034	ALBASIA FALCATA FINGER JOINT 19.1x89x4877	0.8290	PAK00125	PACKING TUMPUK SEPATU 25	100	GPAK	100	Active	1	GKPP	Set	0.008300
603	FGF00035	ALBASIA FALCATA FINGER JOINT WBP 41.3x457x2540	4.7940	RMF00072	FINGER JOINT 41.3x457x2540	4.794	GPAK	100	Active	0	FGOD	m3	1.000000
604	FGF00035	ALBASIA FALCATA FINGER JOINT WBP 41.3x457x2540	4.7940	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.047900
605	FGF00043	ALBASIA FALCATA FINGER JOINT WBP 15.8x1220x2440	4.7033	FGF00047	FG FINGER JOINT WBP 15.8x1220x2440	4.7033	GPAK	100	Active	0	FGOD	m3	1.000000
606	FGF00043	ALBASIA FALCATA FINGER JOINT WBP 15.8x1220x2440	4.7033	PAK00118	PACKING TUMPUK 34	100	GPAK	100	Active	1	GKPP	Set	0.047000
607	FGF00044	ALBASIA FALCATA FINGER JOINT WBP 19.1x1220x2440	5.6857	FGF00046	FG FINGER JOINT WBP 19.1x1220x2440	5.6857	GPAK	100	Active	0	FGOD	m3	1.000000
608	FGF00044	ALBASIA FALCATA FINGER JOINT WBP 19.1x1220x2440	5.6857	PAK00118	PACKING TUMPUK 34	100	GPAK	100	Active	1	GKPP	Set	0.056900
609	FGF00053	ALBASIA FALCATA FINGER JOINT 44.5x930x2743	11.3519	FGF00078	FG FINGER JOINT 44.5x930x2743	10.5866	GPAK	100	Active	0	FGOD	m3	1.072300
610	FGF00053	ALBASIA FALCATA FINGER JOINT 44.5x930x2743	11.3519	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.113500
611	FGF00061	ALBASIA FALCATA FINGER JOINT MRE 41.3x457x3073	5.8000	FGF00077	FG FINGER JOINT 41.3x457x3073	5.8	GPAK	100	Active	0	FGOD	m3	1.000000
612	FGF00061	ALBASIA FALCATA FINGER JOINT MRE 41.3x457x3073	5.8000	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.058000
613	FGF00077	FG FINGER JOINT 41.3x457x3073	5.8000	RMF00111	FINGER JOINT 41.3x457x3073	5.8	FGOD	100	Active	0	PFIN	m3	1.000000
614	FGF00078	FG FINGER JOINT 44.5x930x2743	11.3519	RMF00110	FINGER JOINT 44.5x930x2743	11.3519	FGOD	100	Active	0	FGOD	m3	1.000000
615	FGF00086	ALBASIA FALCATA FINGER JOINT MRE 41.3x457x2540	4.7940	FGF00094	FG FINGER JOINT 41.3x457x2540	4.794	GPAK	100	Active	0	FGOD	m3	1.000000
616	FGF00086	ALBASIA FALCATA FINGER JOINT MRE 41.3x457x2540	4.7940	PAK00109	PACKING TUMPUK 49	100	GPAK	100	Active	1	GKPP	Set	0.047900
617	FGF00087	ALBASIA FALCATA FINGER JOINT MRE 54x457x3073	7.5835	FGF00095	FG FINGER JOINT 54x457x3073	7.5835	GPAK	100	Active	0	GKPP	m3	1.000000
618	FGF00087	ALBASIA FALCATA FINGER JOINT MRE 54x457x3073	7.5835	PAK00115	PACKING TUMPUK 36	100	GPAK	100	Active	1	GKPP	Set	0.075800
619	FGF00094	FG FINGER JOINT 41.3x457x2540	4.7940	RMF00072	FINGER JOINT 41.3x457x2540	4.794	FGOD	100	Active	0	PFIN	m3	1.000000
620	FGF00095	FG FINGER JOINT 54x457x3073	7.5835	RMF00112	FINGER JOINT 54x457x3073	7.5835	FGOD	100	Active	0	PFIN	m3	1.000000
621	FGK00003	BLOCKBOARD MRE 18x1220x2440	5.3582	WIV00530	VENEER LG 1.3x1220x2500	0.793	PFIN	100	Active	0	GKOP	m3	6.756900
622	FGK00003	BLOCKBOARD MRE 18x1220x2440	5.3582	WCB00002	CORE BLOCKBOARD MRE 16x1220x2440	4.7629	PFIN	100	Active	1	WIPA	m3	1.125000
623	FGK00003	BLOCKBOARD MRE 18x1220x2440	5.3582	SUP00073	PREMIX UL MRE-1	110	PFIN	100	Active	2	GKOP	Kg	0.048700
624	FGK00007	BLOCKBOARD MRE 25x1220x2440	7.4420	WIV00015	VENEER SG 2x1220x2440	1.1908	PFIN	100	Active	0	GKOP	m3	6.249600
625	FGK00007	BLOCKBOARD MRE 25x1220x2440	7.4420	RMB00101	ALBASIA FALCATA BARECORE B 22x1220x2440	6.549	PFIN	100	Active	1	GKOP	m3	1.136400
626	FGK00007	BLOCKBOARD MRE 25x1220x2440	7.4420	SUP00073	PREMIX UL MRE-1	102.5	PFIN	100	Active	2	GKOP	Kg	0.072600
627	FGK00012	ALBASIA FALCATA BLOCKBOARD 14.5x1220x2440	4.3164	FGK00001	BLOCKBOARD 14.5x1220x2440	4.3164	GPAK	100	Active	0	FGOD	m3	1.000000
628	FGK00012	ALBASIA FALCATA BLOCKBOARD 14.5x1220x2440	4.3164	PAK00134	PACKING BERDIRI 68	100	GPAK	100	Active	1	GKPP	Set	0.043200
629	FGK00013	ALBASIA FALCATA BLOCKBOARD 17.5x1220x2440	5.2094	FGK00002	BLOCKBOARD 17.5x1220x2440	5.2094	GPAK	100	Active	0	FGOD	m3	1.000000
630	FGK00013	ALBASIA FALCATA BLOCKBOARD 17.5x1220x2440	5.2094	PAK00135	PACKING BERDIRI 57	100	GPAK	100	Active	1	GKPP	Set	0.052100
631	FGK00014	ALBASIA FALCATA BLOCKBOARD MRE 18x1220x2440	5.3582	FGK00103	FG BLOCKBOARD MRE 18x1220x2440	5.3582	GPAK	100	Active	0	FGOD	m3	1.000000
632	FGK00014	ALBASIA FALCATA BLOCKBOARD MRE 18x1220x2440	5.3582	PAK00135	PACKING BERDIRI 57	100	GPAK	100	Active	1	GKPP	Set	0.053600
633	FGK00015	ALBASIA FALCATA BLOCKBOARD WBP 18x1232x2451	5.4353	FGK00091	FG BLOCKBOARD MRE 18x1232x2451	5.4353	GPAK	100	Active	0	FGOD	m3	1.000000
634	FGK00015	ALBASIA FALCATA BLOCKBOARD WBP 18x1232x2451	5.4353	PAK00135	PACKING BERDIRI 57	100	GPAK	100	Active	1	GKPP	Set	0.054400
635	FGK00016	ALBASIA FALCATA BLOCKBOARD 18x1280x2480	5.7139	FGK00005	BLOCKBOARD 18x1280x2480	5.7139	GPAK	100	Active	0	FGOD	m3	1.000000
636	FGK00016	ALBASIA FALCATA BLOCKBOARD 18x1280x2480	5.7139	PAK00145	PACKING MIRING 52	100	GPAK	100	Active	1	GKPP	Set	0.057100
637	FGK00017	ALBASIA FALCATA BLOCKBOARD MRE 24x1220x2440	7.1443	FGK00115	FG BLOCKBOARD 24x1220x2440	7.1443	GPAK	100	Active	0	FGOD	m3	1.000000
638	FGK00017	ALBASIA FALCATA BLOCKBOARD MRE 24x1220x2440	7.1443	PAK00136	PACKING BERDIRI 40	100	GPAK	100	Active	1	GKPP	Set	0.071400
639	FGK00018	ALBASIA FALCATA BLOCKBOARD MRE 25x1220x2440	7.4420	FGK00102	FG BLOCKBOARD MRE 25x1220x2440	7.442	GPAK	100	Active	0	FGOD	m3	1.000000
640	FGK00018	ALBASIA FALCATA BLOCKBOARD MRE 25x1220x2440	7.4420	PAK00140	PACKING TUMPUK 27	1	GPAK	100	Active	1	GKPP	Set	7.442000
641	FGK00019	ALBASIA FALCATA BLOCKBOARD 28x832x2052	4.7803	FGK00008	BLOCKBOARD MRE 28x832x2052	4.7803	GPAK	100	Active	0	FGOD	m3	1.000000
642	FGK00019	ALBASIA FALCATA BLOCKBOARD 28x832x2052	4.7803	PAK00112	PACKING TUMPUK 41	100	GPAK	100	Active	1	GKPP	Set	0.047800
643	FGK00020	ALBASIA FALCATA BLOCKBOARD 28x932x2112	5.5115	FGK00009	BLOCKBOARD MRE 28x932x2112	5.5115	GPAK	100	Active	0	FGOD	m3	1.000000
644	FGK00020	ALBASIA FALCATA BLOCKBOARD 28x932x2112	5.5115	PAK00112	PACKING TUMPUK 41	100	GPAK	100	Active	1	GKPP	Set	0.055100
645	FGK00021	ALBASIA FALCATA BLOCKBOARD 33x832x2052	5.6340	FGK00010	BLOCKBOARD 33x832x2052	5.634	GPAK	100	Active	0	FGOD	m3	1.000000
646	FGK00021	ALBASIA FALCATA BLOCKBOARD 33x832x2052	5.6340	PAK00081	PACKING TUMPUK 34 LOKAL	100	GPAK	100	Active	1	GKPP	Set	0.056300
647	FGK00022	ALBASIA FALCATA BLOCKBOARD 33x932x2112	6.4957	FGK00011	BLOCKBOARD 33x932x2112	6.4957	GPAK	100	Active	0	FGOD	m3	1.000000
648	FGK00022	ALBASIA FALCATA BLOCKBOARD 33x932x2112	6.4957	PAK00081	PACKING TUMPUK 34 LOKAL	100	GPAK	100	Active	1	GKPP	Set	0.065000
649	FGK00025	BLOCKBOARD MRE 15x1220x2440	4.4652	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	7.320000
650	FGK00025	BLOCKBOARD MRE 15x1220x2440	4.4652	WCB00001	CORE BLOCKBOARD MRE 13x1220x2440	3.8698	PFIN	100	Active	1	WIPA	m3	1.153900
651	FGK00025	BLOCKBOARD MRE 15x1220x2440	4.4652	SUP00099	PREMIX MRE-0 1020	120	PFIN	100	Active	2	GKOP	Kg	0.037200
652	FGK00034	ALBASIA FALCATA BLOCKBOARD 15x1220x2440	4.4652	FGK00025	BLOCKBOARD MRE 15x1220x2440	4.4652	GPAK	100	Active	0	FGOD	m3	1.000000
653	FGK00034	ALBASIA FALCATA BLOCKBOARD 15x1220x2440	4.4652	PAK00134	PACKING BERDIRI 68	100	GPAK	100	Active	1	GKPP	Set	0.044700
654	FGK00043	ALBASIA FALCATA BLOCKBOARD 40x1220x2440	11.9072	FGK00044	BLOCKBOARD MRE 40x1220x2440	11.9072	GPAK	100	Active	0	FGOD	m3	1.000000
655	FGK00043	ALBASIA FALCATA BLOCKBOARD 40x1220x2440	11.9072	PAK00081	PACKING TUMPUK 34 LOKAL	100	GPAK	100	Active	1	GKPP	Set	0.119100
656	FGK00044	BLOCKBOARD 40x1220x2440	11.9072	RMF00017	FINGER JOINT 36x1220x2440	1	FGOD	100	Active	0	WADA	m3	11.907200
657	FGK00044	BLOCKBOARD 40x1220x2440	11.9072	WIV00015	VENEER SG 2x1220x2440	1.1908	FGOD	100	Active	1	WIVE	m3	9.999300
658	FGK00044	BLOCKBOARD 40x1220x2440	11.9072	SUP00075	PREMIX BONDTITE	1	FGOD	100	Active	2	SUPP	Kg	11.907200
659	FGK00044	BLOCKBOARD 40x1220x2440	11.9072	WIV00064	VENEER LG 1.3x1220x2440	0.774	FGOD	100	Active	6	WIVE	m3	15.384000
660	FGK00045	ALBASIA FALCATA BLOCKBOARD 20x1220x2440	5.9536	FGK00046	BLOCKBOARD MRE 20x1220x2440	5.9536	GPAK	100	Active	0	FGOD	m3	1.000000
661	FGK00045	ALBASIA FALCATA BLOCKBOARD 20x1220x2440	5.9536	PAK00135	PACKING BERDIRI 57	100	GPAK	100	Active	1	GKPP	Set	0.059500
662	FGK00046	BLOCKBOARD MRE 20x1220x2440	5.9536	WIV00015	VENEER SG 2x1220x2440	1.1908	PFIN	100	Active	0	GKOP	m3	4.999700
663	FGK00046	BLOCKBOARD MRE 20x1220x2440	5.9536	RMB00101	ALBASIA FALCATA BARECORE B 22x1220x2440	6.549	PFIN	100	Active	1	GKOP	m3	0.909100
664	FGK00049	ALBASIA FALCATA BLOCKBOARD MRE 12x1245x2464	3.6812	FGK00072	BLOCKBOARD 12x1245x2464	3.6812	GPAK	100	Active	0	FGOD	m3	1.000000
665	FGK00049	ALBASIA FALCATA BLOCKBOARD MRE 12x1245x2464	3.6812	PAK00118	PACKING TUMPUK 34	100	GPAK	100	Active	1	GKPP	Set	0.036800
666	FGK00051	ALBASIA FALCATA BLOCKBOARD + MDF 40x300x300	0.3600	FGK00052	BLOCKBOARD 40x300x300	1	FGOD	100	Active	0	PFIN	m3	0.360000
667	FGK00051	ALBASIA FALCATA BLOCKBOARD + MDF 40x300x300	0.3600	PAK00006	KARTON, BC 4.0	1	FGOD	100	Active	1	SUPP	kg	0.360000
668	FGK00051	ALBASIA FALCATA BLOCKBOARD + MDF 40x300x300	0.3600	PAK00003	PLASTIK PE 0.6, BC 4.0	1	FGOD	100	Active	2	SUPP	kg	0.360000
669	FGK00051	ALBASIA FALCATA BLOCKBOARD + MDF 40x300x300	0.3600	PAK00002	LAKBAN	1	FGOD	100	Active	3	SUPP	mtr	0.360000
670	FGK00054	ALBASIA FALCATA BLOCKBOARD FJLC WBP 38x1232x2451	11.4746	FGD00244	FG DOORCORE WBP 38x1232x2451	11.4746	GPAK	100	Active	0	FGOD	m3	1.000000
671	FGK00054	ALBASIA FALCATA BLOCKBOARD FJLC WBP 38x1232x2451	11.4746	PAK00138	PACKING BERDIRI 25	100	GPAK	100	Active	1	GKPP	Set	0.114700
672	FGK00055	ALBASIA FALCATA BLOCKBOARD WBP 44.5x1232x2451	13.4374	FGK00058	BLOCKBOARD 44.5x1232x2451	13.4374	GPAK	100	Active	0	FGOD	m3	1.000000
673	FGK00055	ALBASIA FALCATA BLOCKBOARD WBP 44.5x1232x2451	13.4374	PAK00139	PACKING BERDIRI 23	100	GPAK	100	Active	1	GKPP	Set	0.134400
674	FGK00056	ALBASIA FALCATA BLOCKBOARD 57x1232x2451	17.2119	FGK00059	BLOCKBOARD 57x1232x2451	17.2119	GPAK	100	Active	0	FGOD	m3	1.000000
675	FGK00056	ALBASIA FALCATA BLOCKBOARD 57x1232x2451	17.2119	PAK00139	PACKING BERDIRI 23	100	GPAK	100	Active	1	GKPP	Set	0.172100
676	FGK00057	BLOCKBOARD 38x1232x2451	11.4746	RMM00004	MDF 2.5x1245x2460	1.5314	FGOD	100	Active	0	WADA	m3	7.492900
677	FGK00057	BLOCKBOARD 38x1232x2451	11.4746	RMF00022	FINGER JOINT 33.5x1232x2451	10.1158	FGOD	100	Active	1	WADA	m3	1.134300
678	FGK00057	BLOCKBOARD 38x1232x2451	11.4746	SUP00075	PREMIX BONDTITE	99	FGOD	100	Active	2	SUPP	Kg	0.115900
679	FGK00058	BLOCKBOARD 44.5x1232x2451	13.4374	RMM00012	MDF 2.5x1265x2485	1.5718	FGOD	100	Active	0	WADA	m3	8.549100
680	FGK00058	BLOCKBOARD 44.5x1232x2451	13.4374	RMF00023	FINGER JOINT 40x1232x2451	12.0785	FGOD	100	Active	1	WADA	m3	1.112500
681	FGK00058	BLOCKBOARD 44.5x1232x2451	13.4374	SUP00075	PREMIX BONDTITE	99	FGOD	100	Active	2	SUPP	Kg	0.135700
682	FGK00059	BLOCKBOARD 57x1232x2451	17.2119	RMM00012	MDF 2.5x1265x2485	1.5718	FGOD	100	Active	0	WADA	m3	10.950400
683	FGK00059	BLOCKBOARD 57x1232x2451	17.2119	RMF00024	FINGER JOINT 52.5x1232x2451	15.8531	FGOD	100	Active	1	WADA	m3	1.085700
684	FGK00059	BLOCKBOARD 57x1232x2451	17.2119	SUP00075	PREMIX BONDTITE	99	FGOD	100	Active	2	SUPP	Kg	0.173900
685	FGK00061	ALBASIA FALCATA BLOCKBOARD MRE 18x1220x2500	5.4900	FGK00081	FG BLOCKBOARD MRE 18x1220x2500	5.49	GPAK	100	Active	0	FGOD	m3	1.000000
686	FGK00061	ALBASIA FALCATA BLOCKBOARD MRE 18x1220x2500	5.4900	PAK00114	PACKING BERDIRI 41	100	GPAK	100	Active	1	GKPP	Set	0.054900
687	FGK00064	ALBASIA FALCATA BLOCKBOARD 12.3x1220x2500	3.7515	FGK00066	BLOCKBOARD 12.3x1220x2500	3.7515	GPAK	100	Active	0	FGOD	m3	1.000000
688	FGK00064	ALBASIA FALCATA BLOCKBOARD 12.3x1220x2500	3.7515	PAK00102	PACKING BERDIRI 80	100	GPAK	100	Active	1	GKPP	Set	0.037500
689	FGK00065	ALBASIA FALCATA BLOCKBOARD 18.8x1220x2500	5.7340	FGK00067	BLOCKBOARD 18.8x1220x2500	5.734	GPAK	100	Active	0	FGOD	m3	1.000000
690	FGK00065	ALBASIA FALCATA BLOCKBOARD 18.8x1220x2500	5.7340	PAK00135	PACKING BERDIRI 57	100	GPAK	100	Active	1	GKPP	Set	0.057300
691	FGK00066	BLOCKBOARD 12.3x1220x2500	3.7515	WIV00064	VENEER LG 1.3x1220x2440	0.774	PFIN	100	Active	0	WIVE	m3	4.846900
692	FGK00066	BLOCKBOARD 12.3x1220x2500	3.7515	RMF00038	FINGER JOINT 9x1220x2500	2.745	PFIN	100	Active	1	WADA	m3	1.366700
693	FGK00066	BLOCKBOARD 12.3x1220x2500	3.7515	WIV00005	VENEER SG 1.3x1220x2440	0.774	PFIN	100	Active	2	WIVE	m3	4.846900
694	FGK00066	BLOCKBOARD 12.3x1220x2500	3.7515	SUP00075	PREMIX BONDTITE	198	PFIN	100	Active	3	GKOP	Kg	0.018900
695	FGK00067	BLOCKBOARD 18.8x1220x2500	5.7340	WIV00297	VENEER LG 1.7X1220X2440	1.0122	PFIN	100	Active	0	WIVE	m3	5.664900
696	FGK00067	BLOCKBOARD 18.8x1220x2500	5.7340	WCB00006	CORE BLOCKBOARD 16.2x1220x2500	4.941	PFIN	100	Active	1	WIPA	m3	1.160500
697	FGK00067	BLOCKBOARD 18.8x1220x2500	5.7340	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.057900
698	FGK00068	ALBASIA FALCATA BLOCKBOARD+MDF WBP 18x1232x2451	5.4353	FGK00091	FG BLOCKBOARD MRE 18x1232x2451	5.4353	GPAK	100	Active	0	FGOD	m3	1.000000
699	FGK00068	ALBASIA FALCATA BLOCKBOARD+MDF WBP 18x1232x2451	5.4353	PAK00112	PACKING TUMPUK 41	100	GPAK	100	Active	1	GKPP	Set	0.054400
700	FGK00069	ALBASIA FALCATA BLOCKBOARD MDF WBP 38x1232x2451	11.4746	FGK00090	FG BLOCKBOARD 38x1232x2451	11.4746	GPAK	100	Active	0	FGOD	m3	1.000000
701	FGK00069	ALBASIA FALCATA BLOCKBOARD MDF WBP 38x1232x2451	11.4746	PAK00084	PACKING TUMPUK 29	100	GPAK	100	Active	1	GKPP	Set	0.114700
702	FGK00070	ALBASIA FALCATA BLOCKBOARD MRE 44x1232x2451	13.2864	FGK00092	FG BLOCKBOARD 44x1232x2451	13.2864	GPAK	100	Active	0	FGOD	m3	1.000000
703	FGK00070	ALBASIA FALCATA BLOCKBOARD MRE 44x1232x2451	13.2864	PAK00139	PACKING BERDIRI 23	100	GPAK	100	Active	1	GKPP	Set	0.132900
704	FGK00071	BLOCKBOARD 44x1232x2451	13.2864	RMM00012	MDF 2.5x1265x2485	1.5718	FGOD	100	Active	0	WADA	m3	8.453000
705	FGK00071	BLOCKBOARD 44x1232x2451	13.2864	RMF00023	FINGER JOINT 39.5x1232x2451	11.9275	FGOD	100	Active	1	WADA	m3	1.113900
706	FGK00071	BLOCKBOARD 44x1232x2451	13.2864	SUP00075	PREMIX BONDTITE	99	FGOD	100	Active	2	GKOP	Kg	0.134200
707	FGK00075	ALBASIA FALCATA BLOCKBOARD WBP 12.3x1245x2464	3.7732	FGK00087	FG BLOCKBOARD 12.3x1245x2464	3.7732	GPAK	100	Active	0	FGOD	m3	1.000000
708	FGK00075	ALBASIA FALCATA BLOCKBOARD WBP 12.3x1245x2464	3.7732	PAK00102	PACKING BERDIRI 80	100	GPAK	100	Active	1	GKPP	Set	0.037700
709	FGK00076	ALBASIA FALCATA BLOCKBOARD WBP 18.8x1245x2464	5.7672	FGK00089	FG BLOCKBOARD WBP 18.8x1245x2464	5.7672	GPAK	100	Active	0	FGOD	m3	1.000000
710	FGK00076	ALBASIA FALCATA BLOCKBOARD WBP 18.8x1245x2464	5.7672	PAK00135	PACKING BERDIRI 57	100	GPAK	100	Active	1	GKPP	Set	0.057700
711	FGK00078	BLOCKBOARD MRE 15x1220x2135	3.9071	WIV00613	VENEER LG 1x1220x2200	0.5368	PFIN	100	Active	0	GKOP	m3	7.278500
712	FGK00078	BLOCKBOARD MRE 15x1220x2135	3.9071	WCB00010	CORE BLOCKBOARD MRE 13x1220x2135	3.3861	PFIN	100	Active	1	WIPA	m3	1.153900
713	FGK00078	BLOCKBOARD MRE 15x1220x2135	3.9071	SUP00099	PREMIX MRE-0 1020	120	PFIN	100	Active	2	GKOP	Kg	0.032600
714	FGK00079	ALBASIA FALCATA BLOCKBOARD FJLC WBP 44x1232x3061	16.5931	FGK00097	FG BLOCKBOARD HENGKEL 44x1232x3061	16.5931	GPAK	100	Active	0	FGOD	m3	1.000000
715	FGK00079	ALBASIA FALCATA BLOCKBOARD FJLC WBP 44x1232x3061	16.5931	PAK00125	PACKING TUMPUK SEPATU 25	100	GPAK	100	Active	1	GKPP	Set	0.165900
716	FGK00080	ALBASIA FALCATA BLOCKBOARD MRE 15x1220x2135	3.9071	FGK00093	FG BLOCKBOARD MRE 15x1220x2135	3.9071	GPAK	100	Active	0	FGOD	m3	1.000000
717	FGK00080	ALBASIA FALCATA BLOCKBOARD MRE 15x1220x2135	3.9071	PAK00103	PACKING TUMPUK 73	100	GPAK	100	Active	1	GKPP	Set	0.039100
718	FGK00081	FG BLOCKBOARD MRE 18x1220x2500	5.4900	WIV00015	VENEER SG 2x1220x2440	1.1908	FGOD	100	Active	0	GKOP	m3	4.610300
719	FGK00081	FG BLOCKBOARD MRE 18x1220x2500	5.4900	RMB00055	ALBASIA FALCATA BARECORE A 15x1220x2500	4.575	FGOD	100	Active	1	GKOP	m3	1.200000
720	FGK00081	FG BLOCKBOARD MRE 18x1220x2500	5.4900	SUP00073	PREMIX UL MRE-1	117.1504	FGOD	100	Active	2	GKOP	Kg	0.046900
721	FGK00085	BLOCKBOARD 15x1232x2451	4.5294	WIV00064	VENEER LG 1.3x1220x2440	0.774	PFIN	100	Active	0	GKOP	m3	5.851900
722	FGK00085	BLOCKBOARD 15x1232x2451	4.5294	WCB00001	CORE BLOCKBOARD 13x1220x2440	3.8698	PFIN	100	Active	1	WIPA	m3	1.170400
723	FGK00085	BLOCKBOARD 15x1232x2451	4.5294	SUP00079	PREMIX UL MRE-0	102.5	PFIN	100	Active	2	GKOP	Kg	0.044200
724	FGK00087	FG BLOCKBOARD 12.3x1245x2464	3.7732	WIV00064	VENEER LG 1.3x1220x2440	0.774	FGOD	100	Active	0	GKOP	m3	4.874900
725	FGK00087	FG BLOCKBOARD 12.3x1245x2464	3.7732	WIV00015	VENEER SG 2x1220x2440	1.1908	FGOD	100	Active	1	GKOP	m3	3.168600
726	FGK00087	FG BLOCKBOARD 12.3x1245x2464	3.7732	RMF00045	FINGER JOINT 8x1245x2464	2.4541	FGOD	100	Active	2	GKOP	m3	1.537500
727	FGK00087	FG BLOCKBOARD 12.3x1245x2464	3.7732	SUP00075	PREMIX BONDTITE	234.3009	FGOD	100	Active	3	GKOP	Kg	0.016100
728	FGK00089	FG BLOCKBOARD WBP 18.8x1245x2464	5.7672	WIV00400	VENEER LG 1.5x1220x2440	0.893	FGOD	100	Active	0	GKOP	m3	6.458200
729	FGK00089	FG BLOCKBOARD WBP 18.8x1245x2464	5.7672	WIV00035	VENEER SG 3x1220x2440	1.786	FGOD	100	Active	1	GKOP	m3	3.229100
730	FGK00089	FG BLOCKBOARD WBP 18.8x1245x2464	5.7672	RMF00046	FINGER JOINT 11.5x1245x2464	3.5278	FGOD	100	Active	2	GKOP	m3	1.634800
731	FGK00089	FG BLOCKBOARD WBP 18.8x1245x2464	5.7672	SUP00075	PREMIX BONDTITE	234.3009	FGOD	100	Active	3	GKOP	Kg	0.024600
732	FGK00090	FG BLOCKBOARD 38x1232x2451	11.4746	RMM00004	MDF 2.5x1245x2460	1.5314	FGOD	100	Active	0	GKOP	m3	7.492900
733	FGK00090	FG BLOCKBOARD 38x1232x2451	11.4746	RMF00022	FINGER JOINT 33.5x1232x2451	10.1158	FGOD	100	Active	1	GKOP	m3	1.134300
734	FGK00090	FG BLOCKBOARD 38x1232x2451	11.4746	SUP00075	PREMIX BONDTITE	117.1504	FGOD	100	Active	2	GKOP	Kg	0.097900
735	FGK00091	FG BLOCKBOARD MRE 18x1232x2451	5.4353	WIV00064	VENEER LG 1.3x1220x2440	0.774	FGOD	100	Active	0	GKOP	m3	7.022400
736	FGK00091	FG BLOCKBOARD MRE 18x1232x2451	5.4353	RMB00063	ALBASIA FALCATA BARECORE A 13x1220x2500	3.965	FGOD	100	Active	1	GKOP	m3	1.370800
737	FGK00091	FG BLOCKBOARD MRE 18x1232x2451	5.4353	WIV00015	VENEER SG 2x1220x2440	1.1908	FGOD	100	Active	2	GKOP	m3	4.564400
738	FGK00091	FG BLOCKBOARD MRE 18x1232x2451	5.4353	SUP00073	PREMIX UL MRE-1	234.3009	FGOD	100	Active	3	GKOP	Kg	0.023200
739	FGK00092	FG BLOCKBOARD 44x1232x2451	13.2864	RMM00012	MDF 2.5x1265x2485	1.5718	FGOD	100	Active	0	GKOP	m3	8.453000
740	FGK00092	FG BLOCKBOARD 44x1232x2451	13.2864	RMF00023	FINGER JOINT 39.5x1232x2451	11.9275	FGOD	100	Active	1	GKOP	m3	1.113900
741	FGK00092	FG BLOCKBOARD 44x1232x2451	13.2864	SUP00075	PREMIX BONDTITE	117.1504	FGOD	100	Active	2	GKOP	Kg	0.113400
742	FGK00093	FG BLOCKBOARD MRE 15x1220x2135	3.9071	WIV00063	VENEER LG 1.3x1220x2200	0.6978	FGOD	100	Active	0	GKOP	m3	5.599200
743	FGK00093	FG BLOCKBOARD MRE 15x1220x2135	3.9071	SUP00079	PREMIX UL MRE-0	208.8729	FGOD	100	Active	1	GKOP	Kg	0.018700
744	FGK00093	FG BLOCKBOARD MRE 15x1220x2135	3.9071	RMB00076	ALBASIA FALCATA BARECORE A 10.5x1220x2135	2.7349	FGOD	100	Active	2	GKOP	m3	1.428600
745	FGK00093	FG BLOCKBOARD MRE 15x1220x2135	3.9071	WIV00281	VENEER SG 2x1220x2200	1.0736	FGOD	100	Active	3	GKOP	m3	3.639300
746	FGK00102	FG BLOCKBOARD MRE 25x1220x2440	7.4420	FGK00007	BLOCKBOARD MRE 25x1220x2440	7.442	FGOD	100	Active	0	PFIN	m3	1.000000
747	FGK00103	FG BLOCKBOARD MRE 18x1220x2440	5.3582	FGK00003	BLOCKBOARD MRE 18x1220x2440	5.3582	FGOD	100	Active	0	PFIN	m3	1.000000
748	FGK00151	ALBASIA FALCATA BLOCKBOARD FJLC MRE 25x920x2150	4.9450	FGK00159	FG BLOCKBOARD FJLC MRE 25x920x2150	4.945	GPAK	100	Active	0	FGOD	m3	1.000000
749	FGK00151	ALBASIA FALCATA BLOCKBOARD FJLC MRE 25x920x2150	4.9450	PAK00109	PACKING TUMPUK 49	100	GPAK	100	Active	1	GKPP	Set	0.049500
750	FGK00152	ALBASIA FALCATA BLOCKBOARD FJLC MRE 33x920x2150	6.5274	FGK00160	FG BLOCKBOARD FJLC MRE 33x920x2150	6.5274	GPAK	100	Active	0	FGOD	m3	1.000000
751	FGK00152	ALBASIA FALCATA BLOCKBOARD FJLC MRE 33x920x2150	6.5274	PAK00115	PACKING TUMPUK 36	100	GPAK	100	Active	1	GKPP	Set	0.065300
752	FGK00153	ALBASIA FALCATA BLOCKBOARD FJLC MDF WBP 38x1220x2440	11.3118	FGK00161	FG BLOCKBOARD FJLC MDF WBP 38x1220x2440	11.3118	GPAK	100	Active	0	FGOD	m3	1.000000
753	FGK00153	ALBASIA FALCATA BLOCKBOARD FJLC MDF WBP 38x1220x2440	11.3118	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.113100
754	FGK00154	ALBASIA FALCATA BLOCKBOARD FJLC MDF WBP 44x1220x2440	13.0979	FGK00162	FG BLOCKBOARD FJLC MDF WBP 44x1220x2440	13.0979	GPAK	100	Active	0	FGOD	m3	1.000000
755	FGK00154	ALBASIA FALCATA BLOCKBOARD FJLC MDF WBP 44x1220x2440	13.0979	PAK00139	PACKING BERDIRI 23	100	GPAK	100	Active	1	GKPP	Set	0.131000
756	FGK00158	BLOCKBOARD FJLC MDF WBP 44x1220x2440	13.0979	RMM00012	MDF 2.5x1265x2485	1.5718	PFIN	100	Active	0	GKOP	m3	8.333100
757	FGK00158	BLOCKBOARD FJLC MDF WBP 44x1220x2440	13.0979	RMF00084	FINGER JOINT 40x1220x2440	11.9072	PFIN	100	Active	1	GKOP	m3	1.100000
758	FGK00158	BLOCKBOARD FJLC MDF WBP 44x1220x2440	13.0979	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.132300
759	FGK00203	ALBASIA FALCATA BLOCKBOARD WBP 15.8x1220x2440	4.7033	FGK00206	FG BLOCKBOARD WBP 15.8x1220x2440	4.7033	GPAK	100	Active	0	FGOD	m3	1.000000
760	FGK00203	ALBASIA FALCATA BLOCKBOARD WBP 15.8x1220x2440	4.7033	PAK00115	PACKING TUMPUK 36	100	GPAK	100	Active	1	GKPP	Set	0.047000
761	FGK00204	ALBASIA FALCATA BLOCKBOARD FJLC WBP 19.1x1220x2440	5.6857	FGK00212	FG BLOCKBOARD FJLC WBP 19.1x1220x2440	5.6857	GPAK	100	Active	0	FGOD	m3	1.000000
762	FGK00204	ALBASIA FALCATA BLOCKBOARD FJLC WBP 19.1x1220x2440	5.6857	PAK00118	PACKING TUMPUK 34	100	GPAK	100	Active	1	GKPP	Set	0.056900
763	FGK00205	ALBASIA FALCATA BLOCKBOARD FJLC MDF WBP 18x1220x2440	5.3582	FGK00229	FG BLOCKBOARD FJLC MDF WBP 18x1220x2440	5.3582	GPAK	100	Active	0	FGOD	m3	1.000000
764	FGK00205	ALBASIA FALCATA BLOCKBOARD FJLC MDF WBP 18x1220x2440	5.3582	PAK00136	PACKING BERDIRI 40	100	GPAK	100	Active	1	GKPP	Set	0.053600
765	FGK00229	FG BLOCKBOARD FJLC MDF WBP 18x1220x2440	5.3582	RMM00012	MDF 2.5x1265x2485	1.5718	FGOD	100	Active	0	GKOP	m3	3.409000
766	FGK00229	FG BLOCKBOARD FJLC MDF WBP 18x1220x2440	5.3582	RMF00097	FINGER JOINT 14x1220x2440	4.1675	FGOD	100	Active	1	GKOP	m3	1.285700
767	FGK00229	FG BLOCKBOARD FJLC MDF WBP 18x1220x2440	5.3582	SUP00075	PREMIX BONDTITE	99	FGOD	100	Active	2	GKOP	Kg	0.054100
768	FGK00233	ALBASIA FALCATA BLOCKBOARD FJLC MDF WBP 18x1232x3061	6.7881	FGK00260	FG BLOCKBOARD FJLC MDF MRE 18x1232x3061	6.7881	GPAK	100	Active	0	FGOD	m3	1.000000
769	FGK00233	ALBASIA FALCATA BLOCKBOARD FJLC MDF WBP 18x1232x3061	6.7881	PAK00112	PACKING TUMPUK 41	100	GPAK	100	Active	1	GKPP	Set	0.067900
770	FGK00234	ALBASIA FALCATA BLOCKBOARD FJLC MDF MRE 38x1232x3061	14.3304	FGK00261	FG BLOCKBOARD FJLC MDF MRE 38x1232x3061	14.3304	GPAK	100	Active	0	FGOD	m3	1.000000
771	FGK00234	ALBASIA FALCATA BLOCKBOARD FJLC MDF MRE 38x1232x3061	14.3304	PAK00121	PACKING TUMPUK 30	100	GPAK	100	Active	1	GKPP	Set	0.143300
772	FGK00235	ALBASIA FALCATA BLOCKBOARD MRE 15x1220x2134	3.9052	FGK00246	FG BLOCKBOARD MRE 15x1220x2134	3.9052	GPAK	100	Active	0	FGOD	m3	1.000000
773	FGK00235	ALBASIA FALCATA BLOCKBOARD MRE 15x1220x2134	3.9052	PAK00103	PACKING TUMPUK 73	100	GPAK	100	Active	1	GKOP	Set	0.039100
774	FGK00236	ALBASIA FALCATA BLOCKBOARD FJLC MRE 12x1220x2500	3.6600	FGK00299	FG BLOCKBOARD FJLC MRE 12x1220x2500	1	GPAK	100	Active	0	FGOD	m3	3.660000
775	FGK00236	ALBASIA FALCATA BLOCKBOARD FJLC MRE 12x1220x2500	3.6600	PAK00140	PACKING TUMPUK 27	1	GPAK	100	Active	1	SUPP	Set	3.660000
776	FGK00238	ALBASIA FALCATA BLOCKBOARD FJLC MDF MRE 44x1232x3061	16.5931	FGK00262	FG BLOCKBOARD FJLC MDF MRE 44x1232x3061	16.5931	GPAK	100	Active	0	FGOD	m3	1.000000
777	FGK00238	ALBASIA FALCATA BLOCKBOARD FJLC MDF MRE 44x1232x3061	16.5931	PAK00109	PACKING TUMPUK 49	100	GPAK	100	Active	1	GKPP	Set	0.165900
778	FGK00239	ALBASIA FALCATA BLOCKBOARD MRE 25x920x2150	4.9450	FGK00242	FG BLOCKBOARD MRE 25x920x2150	4.945	GPAK	100	Active	0	FGOD	m3	1.000000
779	FGK00239	ALBASIA FALCATA BLOCKBOARD MRE 25x920x2150	4.9450	PAK00140	PACKING TUMPUK 27	100	GPAK	100	Active	1	GKPP	Set	0.049500
780	FGK00240	BLOCKBOARD MRE 25x920x2150	4.9450	WIV00008	VENEER SG 2x930x2150	0.7998	PFIN	100	Active	0	GKOP	m3	6.182800
781	FGK00240	BLOCKBOARD MRE 25x920x2150	4.9450	RMB00144	ALBASIA FALCATA BARECORE B 22x920x2150	4.3516	PFIN	100	Active	1	WADA	m3	1.136400
782	FGK00240	BLOCKBOARD MRE 25x920x2150	4.9450	SUP00073	PREMIX UL MRE-1	76.875	PFIN	100	Active	2	GKOP	Kg	0.064300
783	FGK00241	BLOCKBOARD MRE 15x1220x2134	3.9052	WIV00613	VENEER LG 1x1220x2200	0.5368	PFIN	100	Active	0	GKOP	m3	7.275000
784	FGK00241	BLOCKBOARD MRE 15x1220x2134	3.9052	WCB00010	CORE BLOCKBOARD MRE 13x1220x2135	3.3861	PFIN	100	Active	1	WIPA	m3	1.153300
785	FGK00241	BLOCKBOARD MRE 15x1220x2134	3.9052	SUP00099	PREMIX MRE-0 1020	120	PFIN	100	Active	2	GKOP	Kg	0.032500
786	FGK00242	FG BLOCKBOARD MRE 25x920x2150	4.9450	FGK00240	BLOCKBOARD MRE 25x920x2150	4.945	FGOD	100	Active	0	PFIN	m3	1.000000
787	FGK00252	BLOCKBOARD FJLC MRE 12x1220x2440	3.5722	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	5.856100
788	FGK00252	BLOCKBOARD FJLC MRE 12x1220x2440	3.5722	WCB00007	CORE BLOCKBOARD MRE 10x1220x2500	3.05	PFIN	100	Active	1	WIPA	m3	1.171200
789	FGK00252	BLOCKBOARD FJLC MRE 12x1220x2440	3.5722	SUP00099	PREMIX MRE-0 1020	120	PFIN	100	Active	2	GKOP	Kg	0.029800
790	FGK00255	BLOCKBOARD FJLC MRE 15x1220x2440	4.4652	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	7.320000
791	FGK00255	BLOCKBOARD FJLC MRE 15x1220x2440	4.4652	WCB00001	CORE BLOCKBOARD MRE 13x1220x2440	3.8698	PFIN	100	Active	1	WIPA	m3	1.153900
792	FGK00255	BLOCKBOARD FJLC MRE 15x1220x2440	4.4652	SUP00099	PREMIX MRE-0 1020	120	PFIN	100	Active	2	GKOP	Kg	0.037200
793	FGK00260	FG BLOCKBOARD FJLC MDF MRE 18x1232x3061	6.7881	FGK00263	BLOCKBOARD FJLC MDF MRE 18x1232x3061	6.7881	FGOD	100	Active	0	PFIN	m3	1.000000
794	FGK00261	FG BLOCKBOARD FJLC MDF MRE 38x1232x3061	14.3304	FGK00264	BLOCKBOARD FJLC MDF MRE 38x1232x3061	14.3304	FGOD	100	Active	0	PFIN	m3	1.000000
795	FGK00262	FG BLOCKBOARD FJLC MDF MRE 44x1232x3061	6.7881	FGK00265	BLOCKBOARD FJLC MDF WBP 44x1232x3061	16.5931	FGOD	100	Active	0	PFIN	m3	0.409100
796	FGK00263	BLOCKBOARD FJLC MDF MRE 18x1232x3061	6.7881	RMM00030	MDF 2.5x1265x3100	1.9608	PFIN	100	Active	0	GKOP	m3	3.461900
797	FGK00263	BLOCKBOARD FJLC MDF MRE 18x1232x3061	6.7881	RMF00066	FINGER JOINT 14x1232x2451	4.2275	PFIN	100	Active	1	GKOP	m3	1.605700
798	FGK00263	BLOCKBOARD FJLC MDF MRE 18x1232x3061	6.7881	SUP00093	LEM HENKEL AQUENCE SL 8460 BC, 4.0	182.426058	PFIN	100	Active	2	GKOP	kg	0.037200
799	FGK00263	BLOCKBOARD FJLC MDF MRE 18x1232x3061	6.7881	SUP00094	HARDENER HENKEL CATALYST 72-7357 M BC, 4.0	25	PFIN	100	Active	3	GKOP	kg	0.271500
800	FGK00264	BLOCKBOARD FJLC MDF MRE 38x1232x3061	14.3304	RMM00030	MDF 2.5x1265x3100	1.9608	PFIN	100	Active	0	GKOP	m3	7.308400
801	FGK00264	BLOCKBOARD FJLC MDF MRE 38x1232x3061	14.3304	RMF00104	FINGER JOINT 34x1232x3061	12.8219	PFIN	100	Active	1	GKOP	m3	1.117700
802	FGK00264	BLOCKBOARD FJLC MDF MRE 38x1232x3061	14.3304	SUP00093	LEM HENKEL AQUENCE SL 8460 BC, 4.0	70	PFIN	100	Active	2	GKOP	kg	0.204700
803	FGK00264	BLOCKBOARD FJLC MDF MRE 38x1232x3061	14.3304	SUP00094	HARDENER HENKEL CATALYST 72-7357 M BC, 4.0	30	PFIN	100	Active	3	GKOP	kg	0.477700
804	FGK00265	BLOCKBOARD FJLC MDF WBP 44x1232x3061	16.5931	RMM00030	MDF 2.5x1265x3100	1.9608	PFIN	100	Active	0	GKOP	m3	8.462400
805	FGK00265	BLOCKBOARD FJLC MDF WBP 44x1232x3061	16.5931	FGF00071	FINGER JOINT BBP 40.3x1232x3061	15.1977	PFIN	100	Active	1	GKOP	m3	1.091800
806	FGK00265	BLOCKBOARD FJLC MDF WBP 44x1232x3061	16.5931	SUP00093	LEM HENKEL AQUENCE SL 8460 BC, 4.0	182.426058	PFIN	100	Active	2	GKOP	kg	0.091000
807	FGK00265	BLOCKBOARD FJLC MDF WBP 44x1232x3061	16.5931	SUP00094	HARDENER HENKEL CATALYST 72-7357 M BC, 4.0	25	PFIN	100	Active	3	GKOP	kg	0.663700
808	FGK00275	ALBASIA FALCATA BLOCKBOARD FJLC MRE 12x1220x2440	3.5722	FGK00250	FG BLOCKBOARD FJLC MRE 12x1220x2440	3.5722	GPAK	100	Active	0	FGOD	m3	1.000000
809	FGK00275	ALBASIA FALCATA BLOCKBOARD FJLC MRE 12x1220x2440	3.5722	PAK00108	PACKING BERDIRI 61	100	GPAK	100	Active	1	GKOP	Set	0.035700
810	FGK00276	ALBASIA FALCATA BLOCKBOARD FJLC MRE 15x1220x2440	4.4652	FGK00251	FG BLOCKBOARD FJLC MRE 15x1220x2440	4.4652	GPAK	100	Active	0	FGOD	m3	1.000000
811	FGK00276	ALBASIA FALCATA BLOCKBOARD FJLC MRE 15x1220x2440	4.4652	PAK00111	PACKING BERDIRI 49	100	GPAK	100	Active	1	GKPP	Set	0.044700
812	FGK00277	ALBASIA FALCATA BLOCKBOARD FJLC MDF WBP 25x1220x2440	7.4420	FGK00278	FG BLOCKBOARD FJLC MDF WBP 25x1220x2440	1	GPAK	100	Active	0	FGOD	m3	7.442000
813	FGK00277	ALBASIA FALCATA BLOCKBOARD FJLC MDF WBP 25x1220x2440	7.4420	PAK00077	PACKING TUMPUK 80	100	GPAK	100	Active	1	GKPP	Set	0.074400
814	FGK00279	ALBASIA FALCATA BLOCKBOARD FJLC MRE 18x1245x2500	5.6025	FGK00281	FG BLOCKBOARD FJLC MRE 18x1245x2500	5.6025	GPAK	100	Active	0	FGOD	m3	1.000000
815	FGK00279	ALBASIA FALCATA BLOCKBOARD FJLC MRE 18x1245x2500	5.6025	PAK00135	PACKING BERDIRI 57	100	GPAK	100	Active	1	GKPP	Set	0.056000
816	FGK00280	ALBASIA FALCATA BLOCKBOARD FJLC MRE 39.2x1245x2200	10.7369	FGK00282	FG BLOCKBOARD FJLC MRE 39.2x1245x2200	10.7369	GPAK	100	Active	0	FGOD	m3	1.000000
817	FGK00280	ALBASIA FALCATA BLOCKBOARD FJLC MRE 39.2x1245x2200	10.7369	PAK00121	PACKING TUMPUK 30	100	GPAK	100	Active	1	GKPP	Set	0.107400
818	FGK00281	FG BLOCKBOARD FJLC MRE 18x1245x2500	5.6025	FGK00287	BLOCKBOARD FJLC MRE 18x1245x2500	5.6025	FGOD	100	Active	0	PFIN	m3	1.000000
819	FGK00282	FG BLOCKBOARD FJLC MRE 39.2x1245x2200	10.7369	FGK00286	BLOCKBOARD FJLC MRE 39.2x1245x2200	10.7369	FGOD	100	Active	0	PFIN	m3	1.000000
820	FGK00283	FG BLOCKBOARD FJLC MRE 18x1220x2500	5.4900	FGK00285	BLOCKBOARD FJLC MRE 18x1220x2500	5.49	FGOD	100	Active	0	PFIN	m3	1.000000
821	FGK00284	ALBASIA FALCATA BLOCKBOARD FJLC MRE 18x1220x2500	5.4900	FGK00283	FG BLOCKBOARD FJLC MRE 18x1220x2500	5.49	GPAK	100	Active	0	FGOD	m3	1.000000
822	FGK00284	ALBASIA FALCATA BLOCKBOARD FJLC MRE 18x1220x2500	5.4900	PAK00121	PACKING TUMPUK 30	100	GPAK	100	Active	1	GKPP	Set	0.054900
823	FGK00285	BLOCKBOARD FJLC MRE 18x1220x2500	5.4900	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	9.000000
824	FGK00285	BLOCKBOARD FJLC MRE 18x1220x2500	5.4900	WCB00020	CORE BLOCKBOARD FJLC MRE 16x1220x2500	4.88	PFIN	100	Active	1	WIPA	m3	1.125000
825	FGK00285	BLOCKBOARD FJLC MRE 18x1220x2500	5.4900	SUP00099	PREMIX MRE-0 1020	120	PFIN	100	Active	2	GKOP	Kg	0.045800
826	FGK00286	BLOCKBOARD FJLC MRE 39.2x1245x2200	10.7369	WIV00613	VENEER LG 1x1220x2200	0.5368	PFIN	100	Active	0	GKOP	m3	20.001700
827	FGK00286	BLOCKBOARD FJLC MRE 39.2x1245x2200	10.7369	WCB00021	CORE BLOCKBOARD FJLC MRE 37x1245x2200	10.1343	PFIN	100	Active	1	WIPA	m3	1.059500
828	FGK00286	BLOCKBOARD FJLC MRE 39.2x1245x2200	10.7369	SUP00099	PREMIX MRE-0 1020	102.5	PFIN	100	Active	2	GKOP	Kg	0.104800
829	FGK00287	BLOCKBOARD FJLC MRE 18x1245x2500	5.6025	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	9.184400
830	FGK00287	BLOCKBOARD FJLC MRE 18x1245x2500	5.6025	WCB00022	CORE BLOCKBOARD FJLC MRE 16x1245x2500	4.98	PFIN	100	Active	1	WIPA	m3	1.125000
831	FGK00287	BLOCKBOARD FJLC MRE 18x1245x2500	5.6025	SUP00099	PREMIX MRE-0 1020	120	PFIN	100	Active	2	GKOP	Kg	0.046700
832	FGK00289	ALBASIA FALCATA BLOCKBOARD LAMINBOARD WBP 41.3x914x3073	11.6000	FGK00291	FG BLOCKBOARD LAMINBOARD WBP 41.3x914x3073	11.6	GPAK	100	Active	0	FGOD	m3	1.000000
833	FGK00289	ALBASIA FALCATA BLOCKBOARD LAMINBOARD WBP 41.3x914x3073	11.6000	PAK00135	PACKING BERDIRI 57	100	GPAK	100	Active	1	GKOP	Set	0.116000
834	FGK00290	ALBASIA FALCATA BLOCKBOARD LAMINBOARD WBP 41.3x914x2464	9.3012	FGK00292	FG BLOCKBOARD LAMINBOARD WBP 41.3x914x2464	9.3012	GPAK	100	Active	0	FGOD	m3	1.000000
835	FGK00291	FG BLOCKBOARD LAMINBOARD WBP 41.3x914x3073	11.6000	FGK00293	BLOCKBOARD LAMINBOARD WBP 41.3x914x3073	11.6	FGOD	100	Active	0	PFIN	m3	1.000000
836	FGK00292	FG BLOCKBOARD LAMINBOARD WBP 41.3x914x2464	9.3012	FGK00294	BLOCKBOARD LAMINBOARD WBP 41.3x914x2464	9.3012	FGOD	100	Active	0	PFIN	m3	1.000000
837	FGK00293	BLOCKBOARD LAMINBOARD WBP 41.3x914x3073	11.6000	WIV00857	VENEER SG 1.3x930x3100	0.7496	PFIN	100	Active	0	GKOP	m3	15.474900
838	FGK00293	BLOCKBOARD LAMINBOARD WBP 41.3x914x3073	11.6000	FGM00069	LAMINBOARD WBP 38.1x914x3073	10.7012	PFIN	100	Active	1	PFIN	m3	1.084000
839	FGK00293	BLOCKBOARD LAMINBOARD WBP 41.3x914x3073	11.6000	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.117200
840	FGK00294	BLOCKBOARD LAMINBOARD WBP 41.3x914x2464	9.3012	WIV00015	VENEER SG 2x1220x2440	1.1908	PFIN	100	Active	0	GKOP	m3	7.810900
841	FGK00294	BLOCKBOARD LAMINBOARD WBP 41.3x914x2464	9.3012	FGM00068	LAMINBOARD WBP 38.1x914x2464	8.5805	PFIN	100	Active	1	PFIN	m3	1.084000
842	FGK00294	BLOCKBOARD LAMINBOARD WBP 41.3x914x2464	9.3012	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.094000
843	FGK00295	ALBASIA FALCATA BLOCKBOARD FJLC MRE 20x1220x2500	6.1000	FGK00302	FG BLOCKBOARD FJLC MRE 20x1220x2500	6.1	GPAK	100	Active	0	FGOD	m3	1.000000
844	FGK00295	ALBASIA FALCATA BLOCKBOARD FJLC MRE 20x1220x2500	6.1000	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	SUPP	Set	0.061000
845	FGK00297	BLOCKBOARD FJLC MRE 19x1220x2500	5.7950	RMV00018	VENEER BELI LG BB 1x1220x2440	0.2977	PFIN	100	Active	0	GKOP	m3	19.465900
846	FGK00297	BLOCKBOARD FJLC MRE 19x1220x2500	5.7950	RMV00103	VENEER BELI LG CC 1x1220x2440	0.2977	PFIN	100	Active	1	GKOP	m3	19.465900
847	FGK00297	BLOCKBOARD FJLC MRE 19x1220x2500	5.7950	FGF00065	FINGER JOINT BBP 14x1245x2500	4.3575	PFIN	100	Active	2	PVAF	m3	1.329900
949	FGL00052	FG LVL MRE 38x600x2480	5.6544	FGL00006	LVL MRE 38x1200x2480	5.6544	FGOD	100	Active	0	PFIN	m3	1.000000
848	FGK00297	BLOCKBOARD FJLC MRE 19x1220x2500	5.7950	WIV00025	VENEER SG 2.6x1220x1220	1.548	PFIN	100	Active	3	GKOP	m3	3.743500
849	FGK00297	BLOCKBOARD FJLC MRE 19x1220x2500	5.7950	SUP00099	PREMIX MRE-0 1020	211.8	PFIN	100	Active	4	GKOP	Kg	0.027400
850	FGK00299	FG BLOCKBOARD FJLC MRE 12x1220x2500	3.6600	FGK00300	BLOCKBOARD FJLC MRE 12x1220x2500	3.66	FGOD	100	Active	0	PFIN	m3	1.000000
851	FGK00300	BLOCKBOARD FJLC MRE 12x1220x2500	3.6600	RMV00018	VENEER BELI LG BB 1x1220x2440	0.5954	PFIN	100	Active	0	GKOP	m3	6.147100
852	FGK00300	BLOCKBOARD FJLC MRE 12x1220x2500	3.6600	FGF00093	FINGER JOINT BBP 10x1232x2500	3.08	PFIN	100	Active	1	PVAF	m3	1.188300
853	FGK00300	BLOCKBOARD FJLC MRE 12x1220x2500	3.6600	SUP00099	PREMIX MRE-0 1020	211.8	PFIN	100	Active	2	GKOP	Kg	0.017300
854	FGK00300	BLOCKBOARD FJLC MRE 12x1220x2500	3.6600	WIV00448	VENEER SG 1.7x1220x1220	1.012	PFIN	100	Active	3	GKOP	m3	3.616600
855	FGK00301	BLOCKBOARD FJLC MRE 20x1220x2500	6.1000	RMV00018	VENEER BELI LG BB 1x1220x2440	0.5954	PFIN	100	Active	0	GKOP	m3	10.245200
856	FGK00301	BLOCKBOARD FJLC MRE 20x1220x2500	6.1000	FGF00109	FINGER JOINT BBP 18x1220x2440	5.3582	PFIN	100	Active	1	PVAF	m3	1.138400
857	FGK00301	BLOCKBOARD FJLC MRE 20x1220x2500	6.1000	SUP00099	PREMIX MRE-0 1020	211.8	PFIN	100	Active	2	GKOP	Kg	0.028800
858	FGK00301	BLOCKBOARD FJLC MRE 20x1220x2500	6.1000	WIV00448	VENEER SG 1.7x1220x1220	1.012	PFIN	100	Active	3	GKOP	m3	6.027700
859	FGK00302	FG BLOCKBOARD FJLC MRE 20x1220x2500	6.1000	FGK00301	BLOCKBOARD FJLC MRE 20x1220x2500	6.1	FGOD	100	Active	0	PFIN	m3	1.000000
860	FGL00001	LVL F4 12x1220x2440	3.5722	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	5.856100
861	FGL00001	LVL F4 12x1220x2440	3.5722	WCL00009	CORE LVL F4 10x1220x2440	2.9768	PFIN	100	Active	1	WIPA	m3	1.200000
862	FGL00001	LVL F4 12x1220x2440	3.5722	SUP00080	PREMIX UL F*4	99	PFIN	100	Active	2	GKOP	Kg	0.036100
863	FGL00002	LVL 15x1220x2440	4.4652	WCL00001	CORE LVL 13x1220x2440	3.8698	PFIN	100	Active	0	WIPA	m3	1.153900
864	FGL00002	LVL 15x1220x2440	4.4652	WIV00070	VENEER LG 2x1220x2440	1.1908	PFIN	100	Active	1	WIVE	m3	3.749700
865	FGL00002	LVL 15x1220x2440	4.4652	SUP00073	PREMIX UL	100	PFIN	100	Active	2	SUPP	Kg	0.044700
866	FGL00003	LVL 15x1220x2500	4.5750	WCL00001	CORE LVL 13x1220x2440	3.8698	PFIN	100	Active	0	WIPA	m3	1.182200
867	FGL00003	LVL 15x1220x2500	4.5750	WIV00070	VENEER LG 2x1220x2440	1.1908	PFIN	100	Active	1	WIVE	m3	3.842000
868	FGL00003	LVL 15x1220x2500	4.5750	SUP00073	PREMIX UL	100	PFIN	100	Active	2	SUPP	Kg	0.045800
869	FGL00005	LVL 37x1220x2440	11.0142	WIV00070	VENEER LG 2x1220x2440	11.3126	PFIN	100	Active	0	WIVE	m3	0.973600
870	FGL00005	LVL 37x1220x2440	11.0142	SUP00073	PREMIX UL	900	PFIN	100	Active	1	SUPP	Kg	0.012200
871	FGL00006	LVL MRE 38x1200x2480	11.3088	WIV00524	VENEER LG 2x1220x2500	6.71	PFIN	100	Active	0	GKOP	m3	1.685400
872	FGL00006	LVL MRE 38x1200x2480	11.3088	WIV00590	VENEER LG 2.6x1220x2500	0.793	PFIN	100	Active	1	GKOP	m3	14.260800
873	FGL00006	LVL MRE 38x1200x2480	11.3088	WIV00666	VENEER SCRAFT 2x1220x2500	4.27	PFIN	100	Active	2	GKOP	m3	2.648400
874	FGL00006	LVL MRE 38x1200x2480	11.3088	SUP00099	PREMIX MRE-0 1020	1025	PFIN	100	Active	3	GKOP	Kg	0.011000
875	FGL00007	LVL 38x1220x2440	11.3118	WIV00070	VENEER LG 2x1220x2440	11.3126	PFIN	100	Active	0	WIVE	m3	0.999900
876	FGL00007	LVL 38x1220x2440	11.3118	SUP00073	PREMIX UL	900	PFIN	100	Active	1	SUPP	Kg	0.012600
877	FGL00008	LVL 39.8x1220x1220	5.9238	WIV00011	VENEER SG 2x1220x1220	6.2517	PFIN	100	Active	0	WIVE	m3	0.947600
878	FGL00008	LVL 39.8x1220x1220	5.9238	SUP00073	PREMIX UL	1000	PFIN	100	Active	1	SUPP	Kg	0.005900
879	FGL00009	LVL 39.8x1220x2440	11.8477	WIV00070	VENEER LG 2x1220x2440	3.5724	PFIN	100	Active	0	WIVE	m3	3.316500
880	FGL00009	LVL 39.8x1220x2440	11.8477	WIV00032	VENEER SG 2.6x1220x2440	8.514	PFIN	100	Active	1	WIVE	m3	1.391600
881	FGL00009	LVL 39.8x1220x2440	11.8477	SUP00073	PREMIX UL	900	PFIN	100	Active	2	SUPP	Kg	0.013200
882	FGL00010	LVL 39.8x57x305	0.0694	WIV00070	VENEER LG 2x1220x2440	2.3221	PFIN	100	Active	0	WIVE	m3	0.029900
883	FGL00010	LVL 39.8x57x305	0.0694	WIV00032	VENEER SG 2.6x1220x2440	5.5341	PFIN	100	Active	1	WIVE	m3	0.012500
884	FGL00010	LVL 39.8x57x305	0.0694	SUP00073	PREMIX UL	7.9646	PFIN	100	Active	2	SUPP	Kg	0.008700
885	FGL00011	LVL 39.8x57x533	0.1212	WIV00070	VENEER LG 2x1220x2440	2.3221	PFIN	100	Active	0	WIVE	m3	0.052200
886	FGL00011	LVL 39.8x57x533	0.1212	WIV00032	VENEER SG 2.6x1220x2440	5.5341	PFIN	100	Active	1	WIVE	m3	0.021900
887	FGL00011	LVL 39.8x57x533	0.1212	SUP00073	PREMIX UL	900	PFIN	100	Active	2	SUPP	Kg	0.000100
888	FGL00012	LVL 40x820x1967	6.4518	WCL00007	CORE LVL 38x820x1967	6.1292	PFIN	100	Active	0	WIPA	m3	1.052600
889	FGL00012	LVL 40x820x1967	6.4518	WIV00024	VENEER SG 2.6x930x2440	1.18	PFIN	100	Active	1	WIVE	m3	5.467600
890	FGL00012	LVL 40x820x1967	6.4518	SUP00073	PREMIX UL	100	PFIN	100	Active	2	SUPP	Kg	0.064500
891	FGL00013	LVL 40x820x2267	7.4358	WCL00008	CORE LVL 38x820x2267	7.064	PFIN	100	Active	0	WIPA	m3	1.052600
892	FGL00013	LVL 40x820x2267	7.4358	WIV00024	VENEER SG 2.6x930x2440	1.18	PFIN	100	Active	1	WIVE	m3	6.301500
893	FGL00013	LVL 40x820x2267	7.4358	SUP00073	PREMIX UL	100	PFIN	100	Active	2	SUPP	Kg	0.074400
894	FGL00015	LVL 40x860x2267	7.7985	WCL00004	CORE LVL 36x860x2267	7.0186	PFIN	100	Active	0	WIPA	m3	1.111100
895	FGL00015	LVL 40x860x2267	7.7985	WIV00024	VENEER SG 2.6x930x2440	1.18	PFIN	100	Active	1	WIVE	m3	6.608900
896	FGL00015	LVL 40x860x2267	7.7985	SUP00073	PREMIX UL	100	PFIN	100	Active	2	SUPP	Kg	0.078000
897	FGL00016	ALBASIA FALCATA LVL WBP 12x1220x2440	3.5722	FGL00216	FG LVL F4 12x1220x2440	3.5722	GPAK	100	Active	0	FGOD	m3	1.000000
898	FGL00016	ALBASIA FALCATA LVL WBP 12x1220x2440	3.5722	PAK00103	PACKING TUMPUK 73	100	GPAK	100	Active	1	SUPP	Set	0.035700
899	FGL00017	ALBASIA FALCATA LVL F*4 15x1220x2440	4.4652	FGL00051	FG LVL MRE 15x1220x2440	4.4652	GPAK	100	Active	0	FGOD	m3	1.000000
900	FGL00017	ALBASIA FALCATA LVL F*4 15x1220x2440	4.4652	PAK00078	PACKING TUMPUK T.15/50	100	GPAK	100	Active	1	GKPP	Set	0.044700
901	FGL00018	ALBASIA FALCATA LVL 15x1220x2500	4.5750	FGL00003	LVL 15x1220x2500	4.575	GPAK	100	Active	0	FGOD	m3	1.000000
902	FGL00018	ALBASIA FALCATA LVL 15x1220x2500	4.5750	PAK00078	PACKING TUMPUK T.15/50	100	GPAK	100	Active	1	GKPP	Set	0.045800
903	FGL00019	ALBASIA FALCATA LVL WBP 18x1220x2440	5.3582	FGL00004	LVL WBP 18x1220x2440	5.3582	GPAK	100	Active	0	FGOD	m3	1.000000
904	FGL00019	ALBASIA FALCATA LVL WBP 18x1220x2440	5.3582	PAK00079	PACKING TUMPUK T.18/50	100	GPAK	100	Active	1	GKPP	Set	0.053600
905	FGL00020	ALBASIA FALCATA LVL WBP 37x1220x2440	11.0142	FGL00005	LVL MRE 37x1220x2440	11.0142	GPAK	100	Active	0	FGOD	m3	1.000000
906	FGL00020	ALBASIA FALCATA LVL WBP 37x1220x2440	11.0142	PAK00138	PACKING BERDIRI 25	100	GPAK	100	Active	1	GKPP	Set	0.110100
907	FGL00021	ALBASIA FALCATA LVL 38x1200x2480	11.3088	FGL00006	LVL MRE 38x1200x2480	11.3088	GPAK	100	Active	0	FGOD	m3	1.000000
908	FGL00021	ALBASIA FALCATA LVL 38x1200x2480	11.3088	PAK00138	PACKING BERDIRI 25	100	GPAK	100	Active	1	GKPP	Set	0.113100
909	FGL00022	ALBASIA FALCATA LVL 38x1220x2440	11.3118	FGL00007	LVL WBP 38x1220x2440	11.3118	GPAK	100	Active	0	FGOD	m3	1.000000
910	FGL00022	ALBASIA FALCATA LVL 38x1220x2440	11.3118	PAK00138	PACKING BERDIRI 25	100	GPAK	100	Active	1	GKPP	Set	0.113100
911	FGL00023	ALBASIA FALCATA LVL 39.8x1220x1220	5.9238	FGL00008	LVL 39.8x1220x1220	5.9238	GPAK	100	Active	0	FGOD	m3	1.000000
912	FGL00023	ALBASIA FALCATA LVL 39.8x1220x1220	5.9238	PAK00138	PACKING BERDIRI 25	100	GPAK	100	Active	1	GKPP	Set	0.059200
913	FGL00024	ALBASIA FALCATA LVL 39.8x1220x2440	11.8477	FGL00009	LVL 39.8x1220x2440	11.8477	GPAK	100	Active	0	FGOD	m3	1.000000
914	FGL00024	ALBASIA FALCATA LVL 39.8x1220x2440	11.8477	PAK00147	PACKING PNC 122	100	GPAK	100	Active	1	GKPP	Set	0.118500
915	FGL00025	ALBASIA FALCATA LVL 39.9x57x305	0.0694	FGL00284	FG LVL 39.9x57x305	0.0694	GPAK	100	Active	0	FGOD	m3	1.000000
916	FGL00025	ALBASIA FALCATA LVL 39.9x57x305	0.0694	PAK00147	PACKING PNC 122	100	GPAK	100	Active	1	GKPP	Set	0.000700
917	FGL00026	ALBASIA FALCATA LVL 39.9x57x533	0.1212	FGL00285	FG LVL MRE 39.9x57x533	0.1212	GPAK	100	Active	0	FGOD	m3	1.000000
918	FGL00026	ALBASIA FALCATA LVL 39.9x57x533	0.1212	PAK00147	PACKING PNC 122	100	GPAK	100	Active	1	GKPP	Set	0.001200
919	FGL00027	ALBASIA FALCATA LVL 40x820x1967	6.4518	FGL00012	LVL 40x820x1967	6.4518	GPAK	100	Active	0	FGOD	m3	1.000000
920	FGL00027	ALBASIA FALCATA LVL 40x820x1967	6.4518	PAK00084	PACKING TUMPUK 29	100	GPAK	100	Active	1	GKPP	Set	0.064500
921	FGL00028	ALBASIA FALCATA LVL 40x820x2267	7.4358	FGL00013	LVL 40x820x2267	7.4358	GPAK	100	Active	0	FGOD	m3	1.000000
922	FGL00028	ALBASIA FALCATA LVL 40x820x2267	7.4358	PAK00084	PACKING TUMPUK 29	100	GPAK	100	Active	1	GKPP	Set	0.074400
923	FGL00029	ALBASIA FALCATA LVL MRE 40x860x1967	6.7665	FGL00090	FG LVL 40x860x1967	6.7665	GPAK	100	Active	0	FGOD	m3	1.000000
924	FGL00029	ALBASIA FALCATA LVL MRE 40x860x1967	6.7665	PAK00084	PACKING TUMPUK 29	100	GPAK	100	Active	1	GKPP	Set	0.067700
925	FGL00030	ALBASIA FALCATA LVL MRE 40x860x2267	7.7985	FGL00089	FG LVL 40x860x2267	7.7985	GPAK	100	Active	0	FGOD	m3	1.000000
926	FGL00030	ALBASIA FALCATA LVL MRE 40x860x2267	7.7985	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.078000
927	FGL00031	LVL 15x1220x2300	4.2090	WCL00010	CORE LVL 13x1220x2300	3.6478	PFIN	100	Active	0	WIPA	m3	1.153800
928	FGL00031	LVL 15x1220x2300	4.2090	WIV00064	VENEER LG 1.3x1220x2440	1	PFIN	100	Active	1	WIVE	m3	4.209000
929	FGL00031	LVL 15x1220x2300	4.2090	SUP00073	PREMIX UL	100	PFIN	100	Active	2	SUPP	Kg	0.042100
930	FGL00032	ALBASIA FALCATA LVL 15x1220x2300	4.2090	FGL00031	LVL 15x1220x2300	4.209	GPAK	100	Active	0	FGOD	m3	1.000000
931	FGL00032	ALBASIA FALCATA LVL 15x1220x2300	4.2090	PAK00078	PACKING TUMPUK T.15/50	100	GPAK	100	Active	1	GKPP	Set	0.042100
932	FGL00034	LVL 38x600x2480	5.9536	FGL00006	LVL 38x1200x2480	1	PFIN	100	Active	0	PFIN	m3	5.953600
933	FGL00035	ALBASIA FALCATA LVL MRE 38x600x2480	5.6544	FGL00052	FG LVL MRE 38x600x2480	5.6544	GPAK	100	Active	0	FGOD	m3	1.000000
934	FGL00035	ALBASIA FALCATA LVL MRE 38x600x2480	5.6544	PAK00138	PACKING BERDIRI 25	100	GPAK	100	Active	1	GKPP	Set	0.056500
935	FGL00041	LVL MRE 25.4x1220x2438	7.5549	RMV00095	VENEER BELI PINUS 1x1265x2485	0.3144	PFIN	100	Active	0	GKOP	m3	24.029600
936	FGL00041	LVL MRE 25.4x1220x2438	7.5549	WCL00038	CORE LVL MRE 24x1220x2440	7.1443	PFIN	100	Active	1	WIPA	m3	1.057500
937	FGL00041	LVL MRE 25.4x1220x2438	7.5549	WIV00527	VENEER LG 1x1220x2500	0.305	PFIN	100	Active	2	GKOP	m3	24.770200
938	FGL00041	LVL MRE 25.4x1220x2438	7.5549	SUP00099	PREMIX MRE-0 1020	102.5	PFIN	100	Active	3	GKOP	Kg	0.073700
939	FGL00046	ALBASIA FALCATA LVL COATING WBP 19.1x42.9x2032	0.1665	FGL00107	FG LVL COATING 19.1x42.9x2032	0.1665	GPAK	100	Active	0	FGOD	m3	1.000000
940	FGL00046	ALBASIA FALCATA LVL COATING WBP 19.1x42.9x2032	0.1665	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.001700
941	FGL00048	ALBASIA FALCATA LVL COATING WBP 19.1x42.9x838	0.0687	FGL00139	FG LVL GRADING WBP 19.1x42.9x838	0.0687	GPAK	100	Active	0	FGOD	m3	1.000000
942	FGL00048	ALBASIA FALCATA LVL COATING WBP 19.1x42.9x838	0.0687	PAK00149	PACKING LVL CMD	100	GPAK	100	Active	1	GKPP	Set	0.000700
943	FGL00049	ALBASIA FALCATA LVL COATING WBP 19.1x42.9x940	0.0770	FGL00140	FG LVL GRADING WBP 19.1x42.9x940	0.077	GPAK	100	Active	0	FGOD	m3	1.000000
944	FGL00049	ALBASIA FALCATA LVL COATING WBP 19.1x42.9x940	0.0770	PAK00149	PACKING LVL CMD	100	GPAK	100	Active	1	GKPP	Set	0.000800
945	FGL00051	FG LVL MRE 15x1220x2440	4.4652	WIV00064	VENEER LG 1.3x1220x2440	0.774	FGOD	100	Active	0	GKOP	m3	5.769000
946	FGL00051	FG LVL MRE 15x1220x2440	4.4652	WIV00070	VENEER LG 2x1220x2440	3.5724	FGOD	100	Active	1	GKOP	m3	1.249900
947	FGL00051	FG LVL MRE 15x1220x2440	4.4652	WIV00077	VENEER LG 2.6x1220x2440	0.774	FGOD	100	Active	2	GKOP	m3	5.769000
948	FGL00051	FG LVL MRE 15x1220x2440	4.4652	SUP00075	PREMIX BONDTITE	351.4513	FGOD	100	Active	3	GKOP	Kg	0.012700
950	FGL00054	ALBASIA FALCATA LVL MRE 38x550x2480	5.1832	FGL00038	LVL MRE 38x550x2480	5.1832	GPAK	100	Active	0	FGOD	m3	1.000000
951	FGL00054	ALBASIA FALCATA LVL MRE 38x550x2480	5.1832	PAK00138	PACKING BERDIRI 25	100	GPAK	100	Active	1	GKPP	Set	0.051800
952	FGL00057	R LVL 12x1220x2440	3.5722	FGL00001	LVL 12x1220x2440	1	GRPF	100	Active	0	PFIN	m3	3.572200
953	FGL00064	FG LVL 18x1220x2440	5.3582	WIV00530	VENEER LG 1.3x1220x2500	0.793	FGOD	100	Active	0	GKOP	m3	6.756900
954	FGL00064	FG LVL 18x1220x2440	5.3582	WIV00070	VENEER LG 2x1220x2440	5.3586	FGOD	100	Active	1	GKOP	m3	0.999900
955	FGL00064	FG LVL 18x1220x2440	5.3582	SUP00075	PREMIX BONDTITE	585.7522	FGOD	100	Active	2	GKOP	Kg	0.009100
956	FGL00089	FG LVL 40x860x2267	7.7985	WIV00372	VENEER SG 2x930x2400	0.8928	FGOD	100	Active	0	GKOP	m3	8.734900
957	FGL00089	FG LVL 40x860x2267	7.7985	WIV00075	VENEER LG 2.6x930x2440	3.54	FGOD	100	Active	1	GKOP	m3	2.203000
958	FGL00089	FG LVL 40x860x2267	7.7985	WIV00024	VENEER SG 2.6x930x2440	5.31	FGOD	100	Active	2	GKOP	m3	1.468600
959	FGL00089	FG LVL 40x860x2267	7.7985	SUP00073	PREMIX UL MRE-1	434.738	FGOD	100	Active	3	GKOP	Kg	0.017900
960	FGL00090	FG LVL 40x860x1967	6.7665	WIV00024	VENEER SG 2.6x930x2440	1.18	FGOD	100	Active	0	GKOP	m3	5.734300
961	FGL00090	FG LVL 40x860x1967	6.7665	WIV00074	VENEER LG 2.6x930x2200	3.192	FGOD	100	Active	1	GKOP	m3	2.119800
962	FGL00090	FG LVL 40x860x1967	6.7665	WIV00023	VENEER SG 2.6x930x2150	4.6791	FGOD	100	Active	2	GKOP	m3	1.446100
963	FGL00090	FG LVL 40x860x1967	6.7665	SUP00073	PREMIX UL MRE-1	620.0914	FGOD	100	Active	3	GKOP	Kg	0.010900
964	FGL00097	FG LVL 19.1x42.9x838	0.0687	FGL00043	LVL 19.1x42.9x838	0.0687	FGOD	100	Active	0	PFIN	m3	1.000000
965	FGL00098	FG LVL 19.1x42.9x940	0.0770	FGL00042	LVL 19.1x42.9x940	0.077	FGOD	100	Active	0	PFIN	m3	1.000000
966	FGL00099	FG LVL COATING 19.1x42.9x940	0.0770	FGL00098	FG LVL 19.1x42.9x940	0.077	PVAF	100	Active	0	FGOD	m3	1.000000
967	FGL00104	FG LVL 19.1x42.9x2032	0.1665	FGL00044	LVL 19.1x42.9x2032	1	FGOD	100	Active	0	PFIN	m3	0.166500
968	FGL00154	ALBASIA FALCATA LVL COATING RECONSTITUTED WBP 19.1x42.9x2032	0.1665	FGL00107	FG LVL COATING 19.1x42.9x2032	0.1665	GPAK	100	Active	0	FGOD	m3	1.000000
969	FGL00154	ALBASIA FALCATA LVL COATING RECONSTITUTED WBP 19.1x42.9x2032	0.1665	PAK00074	PACKING TUMPUK 210	100	GPAK	100	Active	1	GKPP	Set	0.001700
970	FGL00170	ALBASIA FALCATA LVL COATING RECONSTITUTED WBP 25.4x42.9x2438	0.2657	FGL00178	FG LVL COATING (3) WBP 25.4x42.9x2438	0.2657	GPAK	100	Active	0	FGOD	m3	1.000000
971	FGL00170	ALBASIA FALCATA LVL COATING RECONSTITUTED WBP 25.4x42.9x2438	0.2657	PAK00086	PACKING TUMPUK SEPATU 210	100	GPAK	100	Active	1	GKPP	Set	0.002700
972	FGL00176	ALBASIA FALCATA LVL COATING WBP 19.1x43x838	0.0688	FGL00164	FG LVL GRADING WBP 19.1x43x838	0.0688	GPAK	100	Active	0	FGOD	m3	1.000000
973	FGL00176	ALBASIA FALCATA LVL COATING WBP 19.1x43x838	0.0688	PAK00073	PACKING TUMPUK 280	100	GPAK	100	Active	1	GKPP	Set	0.000700
974	FGL00177	ALBASIA FALCATA LVL COATING WBP 19.1x43x940	0.0772	FGL00165	FG LVL GRADING WBP 19.1x43x940	0.0772	GPAK	100	Active	0	FGOD	m3	1.000000
975	FGL00177	ALBASIA FALCATA LVL COATING WBP 19.1x43x940	0.0772	PAK00074	PACKING TUMPUK 210	100	GPAK	100	Active	1	GKPP	Set	0.000800
976	FGL00195	ALBASIA FALCATA LVL MRE 34x860x1967	5.7515	FGL00202	FG LVL MRE 34x860x1967	5.7515	GPAK	100	Active	0	FGOD	m3	1.000000
977	FGL00195	ALBASIA FALCATA LVL MRE 34x860x1967	5.7515	PAK00121	PACKING TUMPUK 30	100	GPAK	100	Active	1	GKPP	Set	0.057500
978	FGL00196	ALBASIA FALCATA LVL MRE 34x860x2267	6.6287	FGL00203	FG LVL MRE 34x860x2267	6.6287	GPAK	100	Active	0	FGOD	m3	1.000000
979	FGL00196	ALBASIA FALCATA LVL MRE 34x860x2267	6.6287	PAK00121	PACKING TUMPUK 30	100	GPAK	100	Active	1	GKPP	Set	0.066300
980	FGL00197	ALBASIA FALCATA LVL MRE 34x1220x2440	10.1211	FGL00204	FG LVL 34x1220x2440	10.1211	GPAK	100	Active	0	FGOD	m3	1.000000
981	FGL00197	ALBASIA FALCATA LVL MRE 34x1220x2440	10.1211	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.101200
982	FGL00200	LVL MRE 34x860x2267	6.6287	WIV00332	VENEER LG 2x930x2000	0.744	PFIN	100	Active	0	GKOP	m3	8.909500
983	FGL00200	LVL MRE 34x860x2267	6.6287	WCL00030	CORE LVL MRE 30x860x2267	5.8489	PFIN	100	Active	1	WIPA	m3	1.133300
984	FGL00200	LVL MRE 34x860x2267	6.6287	SUP00099	PREMIX MRE-0 1020	102	PFIN	100	Active	2	GKOP	Kg	0.065000
985	FGL00201	LVL MRE 34x860x1967	5.7515	WIV00332	VENEER LG 2x930x2000	0.744	PFIN	100	Active	0	GKOP	m3	7.730500
986	FGL00201	LVL MRE 34x860x1967	5.7515	WCL00029	CORE LVL MRE 30x860x1967	5.0749	PFIN	100	Active	1	WIPA	m3	1.133300
987	FGL00201	LVL MRE 34x860x1967	5.7515	SUP00073	PREMIX UL MRE-1	76.875	PFIN	100	Active	2	GKOP	Kg	0.074800
988	FGL00202	FG LVL MRE 34x860x1967	5.7515	FGL00201	LVL MRE 34x860x1967	5.7515	FGOD	100	Active	0	PFIN	m3	1.000000
989	FGL00203	FG LVL MRE 34x860x2267	6.6287	FGL00200	LVL MRE 34x860x2267	6.6287	FGOD	100	Active	0	PFIN	m3	1.000000
990	FGL00216	FG LVL F4 12x1220x2440	3.5722	FGL00001	LVL F4 12x1220x2440	3.5722	FGOD	100	Active	0	PFIN	m3	1.000000
991	FGL00235	ALBASIA FALCATA LVL WBP SCANTLING 18x64x4877	0.5618	FGL00256	FG LVL WBP SCANTLING 18x64x4877	0.5618	GPAK	100	Active	0	FGOD	m3	1.000000
992	FGL00235	ALBASIA FALCATA LVL WBP SCANTLING 18x64x4877	0.5618	PAK00094	PACKING TUMPUK 120	100	GPAK	100	Active	1	GKPP	Set	0.005600
993	FGL00236	ALBASIA FALCATA LVL WBP SCANTLING 18x89x4877	0.7813	FGL00257	FG LVL WBP SCANTLING 18x89x4877	0.7813	GPAK	100	Active	0	FGOD	m3	1.000000
994	FGL00236	ALBASIA FALCATA LVL WBP SCANTLING 18x89x4877	0.7813	PAK00094	PACKING TUMPUK 120	100	GPAK	100	Active	1	GKPP	Set	0.007800
995	FGL00291	LVL MRE 19.1x1220x2440	5.6857	WIV00070	VENEER LG 2x1220x2440	6.5494	PFIN	100	Active	0	GKOP	m3	0.868100
996	FGL00291	LVL MRE 19.1x1220x2440	5.6857	SUP00099	PREMIX MRE-0 1020	600	PFIN	100	Active	1	GKOP	Kg	0.009500
997	FGL00291	LVL MRE 19.1x1220x2440	5.6857	BTK-ASM	BTK COSTING ASSEMBLY	500	PFIN	100	Active	2	GKOP	Ply	0.011400
998	FGL00291	LVL MRE 19.1x1220x2440	5.6857	BTK-ASM-FINH	BTK COSTING ASSEMBLY-FINH DEMPUL/REVISI	500	PFIN	100	Active	3	GKOP	Ply	0.011400
999	FGL00291	LVL MRE 19.1x1220x2440	5.6857	BTK-ASM-QC	BTK COSTING ASSEMBLY-QC	500	PFIN	100	Active	4	GKOP	Ply	0.011400
1000	FGL00291	LVL MRE 19.1x1220x2440	5.6857	BTK-ASM-TEKN	BTK COSTING ASSEMBLY-TEKNIK	500	PFIN	100	Active	5	GKOP	Ply	0.011400
1001	FGL00291	LVL MRE 19.1x1220x2440	5.6857	LST-ASM	LISTRIK ASSEMBLY	500	PFIN	100	Active	6	GKOP	Ply	0.011400
1002	FGL00292	LVL MRE PINE 19.1x1220x2200	5.1264	WIV00613	VENEER LG 1x1220x2200	0.5368	PFIN	100	Active	0	GKOP	m3	9.549900
1003	FGL00292	LVL MRE PINE 19.1x1220x2200	5.1264	WCL00040	CORE LVL MRE 17x1220x2200	4.5628	PFIN	100	Active	1	WIPA	m3	1.123500
1004	FGL00292	LVL MRE PINE 19.1x1220x2200	5.1264	SUP00099	PREMIX MRE-0 1020	76.875	PFIN	100	Active	2	GKOP	Kg	0.066700
1005	FGL00293	ALBASIA FALCATA LVL MRE 44x950x2440	10.1992	FGL00294	FG LVL MRE 44x950x2440	10.1992	GPAK	100	Active	0	FGOD	m3	1.000000
1006	FGL00293	ALBASIA FALCATA LVL MRE 44x950x2440	10.1992	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.102000
1007	FGL00294	FG LVL MRE 44x950x2440	10.1992	FGL00295	LVL MRE 44x950x2440	10.1992	FGOD	100	Active	0	PFIN	m3	1.000000
1008	FGL00295	LVL MRE 44x950x2440	10.1992	WIV00828	VENEER LG 2x970x2500	0.97	PFIN	100	Active	0	GKOP	m3	10.514600
1009	FGL00295	LVL MRE 44x950x2440	10.1992	WCL00036	CORE LVL MRE 42x950x2440	9.7356	PFIN	100	Active	1	WIPA	m3	1.047600
1010	FGL00295	LVL MRE 44x950x2440	10.1992	SUP00073	PREMIX UL MRE-1	102.5	PFIN	100	Active	2	GKOP	Kg	0.099500
1011	FGL00296	ALBASIA FALCATA LVL COATING PINE MRE 19.1x43x838	0.0688	FGL00322	FG LVL GRADING MRE PINE 19.1x43x838	0.0688	GPAK	100	Active	0	PVAF	m3	1.000000
1012	FGL00296	ALBASIA FALCATA LVL COATING PINE MRE 19.1x43x838	0.0688	PAK00149	PACKING LVL CMD	100	GPAK	100	Active	1	SUPP	Set	0.000700
1013	FGL00297	ALBASIA FALCATA LVL COATING PINE MRE 19.1x43x940	0.0772	FGL00323	FG LVL GRADING MRE PINE 19.1x43x940	0.0772	GPAK	100	Active	0	PVAF	m3	1.000000
1014	FGL00297	ALBASIA FALCATA LVL COATING PINE MRE 19.1x43x940	0.0772	PAK00149	PACKING LVL CMD	100	GPAK	100	Active	1	SUPP	Set	0.000800
1015	FGL00298	ALBASIA FALCATA LVL COATING PINE MRE 19.1x43x2032	0.1669	FGL00321	FG LVL GRADING MRE PINE 19.1x43x2032	0.1669	GPAK	100	Active	0	PVAF	m3	1.000000
1016	FGL00298	ALBASIA FALCATA LVL COATING PINE MRE 19.1x43x2032	0.1669	PAK00149	PACKING LVL CMD	100	GPAK	100	Active	1	SUPP	Set	0.001700
1017	FGL00299	ALBASIA FALCATA LVL COATING PINE MRE 25.4x43x2438	0.2663	FGL00324	FG LVL GRADING MRE PINE 25.4x43x2438	0.2663	GPAK	100	Active	0	PVAF	m3	1.000000
1018	FGL00299	ALBASIA FALCATA LVL COATING PINE MRE 25.4x43x2438	0.2663	PAK00149	PACKING LVL CMD	100	GPAK	100	Active	1	SUPP	Set	0.002700
1019	FGL00301	LVL WBP 40x930x2150	7.9980	WIV00372	VENEER SG 2x930x2400	5.3568	PFIN	100	Active	0	GKOP	m3	1.493100
1020	FGL00301	LVL WBP 40x930x2150	7.9980	WIV00008	VENEER SG 2x930x2150	4.3989	PFIN	100	Active	1	GKOP	m3	1.818200
1021	FGL00301	LVL WBP 40x930x2150	7.9980	SUP00075	PREMIX BONDTITE	816.75	PFIN	100	Active	2	GKOP	Kg	0.009800
1022	FGL00309	LVL MRE PINE 19.1x838x2200	3.5213	RMV00095	VENEER BELI PINUS 1x1265x2485	0.3144	PFIN	100	Active	0	GKOP	m3	11.200100
1023	FGL00309	LVL MRE PINE 19.1x838x2200	3.5213	WCL00042	CORE LVL MRE 17x838x2200	3.1341	PFIN	100	Active	1	WIPA	m3	1.123500
1024	FGL00309	LVL MRE PINE 19.1x838x2200	3.5213	WIV00046	VENEER LG 1x930x2200	0.2046	PFIN	100	Active	2	GKOP	m3	17.210700
1025	FGL00309	LVL MRE PINE 19.1x838x2200	3.5213	SUP00073	PREMIX UL MRE-1	105.6	PFIN	100	Active	3	GKOP	Kg	0.033300
1026	FGL00310	LVL MRE PINE 19.1x930x2200	3.9079	RMV00095	VENEER BELI LG PINUS 1x1265x2485	0.3144	PFIN	100	Active	0	GKOP	m3	12.429700
1027	FGL00310	LVL MRE PINE 19.1x930x2200	3.9079	WCL00041	CORE LVL MRE 17x930x2200	3.4782	PFIN	100	Active	1	WIPA	m3	1.123500
1028	FGL00310	LVL MRE PINE 19.1x930x2200	3.9079	WIV00046	VENEER LG 1x930x2200	0.2046	PFIN	100	Active	2	GKOP	m3	19.100200
1029	FGL00310	LVL MRE PINE 19.1x930x2200	3.9079	SUP00073	PREMIX UL MRE-1	105.6	PFIN	100	Active	3	GKOP	Kg	0.037000
1030	FGL00311	LVL MRE PINE 19.1x1220x1220	2.8428	RMV00095	VENEER BELI LG PINUS 1x1265x2485	0.3144	PFIN	100	Active	0	GKOP	m3	9.042000
1031	FGL00311	LVL MRE PINE 19.1x1220x1220	2.8428	WCL00043	CORE LVL MRE 17x1220x1220	2.5303	PFIN	100	Active	1	WIPA	m3	1.123500
1032	FGL00311	LVL MRE PINE 19.1x1220x1220	2.8428	WIV00613	VENEER LG 1x1220x2200	0.2684	PFIN	100	Active	2	GKOP	m3	10.591700
1033	FGL00311	LVL MRE PINE 19.1x1220x1220	2.8428	SUP00073	PREMIX UL MRE-1	105.6	PFIN	100	Active	3	GKOP	Kg	0.026900
1034	FGM00001	LAMINBOARD 13x1030x2050	2.7450	WIV00070	VENEER LG 2x1220x2440	4.525	PFIN	100	Active	0	WIVE	m3	0.606600
1035	FGM00001	LAMINBOARD 13x1030x2050	2.7450	SUP00073	PREMIX UL	360	PFIN	100	Active	1	SUPP	Kg	0.007600
1036	FGM00003	LAMINBOARD 21x1220x2440	6.2513	WIV00070	VENEER LG 2x1220x2440	11.3126	PFIN	100	Active	0	WIVE	m3	0.552600
1037	FGM00003	LAMINBOARD 21x1220x2440	6.2513	SUP00073	PREMIX UL	900	PFIN	100	Active	1	SUPP	Kg	0.006900
1038	FGM00004	LAMINBOARD 38.5x900x2300	7.9695	WIV00070	VENEER LG 2x1220x2440	13.5751	PFIN	100	Active	0	WIVE	m3	0.587100
1039	FGM00004	LAMINBOARD 38.5x900x2300	7.9695	SUP00073	PREMIX UL	1080	PFIN	100	Active	1	SUPP	Kg	0.007400
1040	FGM00005	LAMINBOARD 49x915x2135	9.5723	WIV00070	VENEER LG 2x1220x2440	15.8376	PFIN	100	Active	0	WIVE	m3	0.604400
1041	FGM00005	LAMINBOARD 49x915x2135	9.5723	SUP00073	PREMIX UL	1260	PFIN	100	Active	1	SUPP	Kg	0.007600
1042	FGM00007	LAMINBOARD 50x915x2135	9.7676	WIV00070	VENEER LG 2x1220x2440	15.8376	PFIN	100	Active	0	WIVE	m3	0.616700
1043	FGM00007	LAMINBOARD 50x915x2135	9.7676	SUP00073	PREMIX UL	1260	PFIN	100	Active	1	SUPP	Kg	0.007800
1044	FGM00008	LAMINBOARD 50x1220x2440	14.8840	WIV00070	VENEER LG 2x1220x2440	23.7565	PFIN	100	Active	0	WIVE	m3	0.626500
1045	FGM00008	LAMINBOARD 50x1220x2440	14.8840	SUP00073	PREMIX UL	1890	PFIN	100	Active	1	SUPP	Kg	0.007900
1046	FGM00010	LAMINBOARD 51x1220x2440	15.1817	WIV00070	VENEER LG 2x1220x2440	24.8877	PFIN	100	Active	0	WIVE	m3	0.610000
1047	FGM00010	LAMINBOARD 51x1220x2440	15.1817	SUP00073	PREMIX UL	1980	PFIN	100	Active	1	SUPP	Kg	0.007700
1048	FGM00039	ALBASIA FALCATA LAMINBOARD 9x780x3150	2.2113	FGM00049	FG LAMINBOARD 9x780x3150	2.2113	GPAK	100	Active	0	FGOD	m3	1.000000
1049	FGM00039	ALBASIA FALCATA LAMINBOARD 9x780x3150	2.2113	PAK00094	PACKING TUMPUK 120	100	GPAK	100	Active	1	GKPP	Set	0.022100
1050	FGM00040	ALBASIA FALCATA LAMINBOARD 12x780x3150	2.9484	FGM00045	FG LAMINBOARD 12x780x3150	2.9484	GPAK	100	Active	0	FGOD	m3	1.000000
1051	FGM00040	ALBASIA FALCATA LAMINBOARD 12x780x3150	2.9484	PAK00097	PACKING TUMPUK 90	100	GPAK	100	Active	1	GKPP	Set	0.029500
1052	FGM00041	ALBASIA FALCATA LAMINBOARD 15x780x3150	3.6855	FGM00046	FG LAMINBOARD 15x780x3150	3.6855	GPAK	100	Active	0	FGOD	m3	1.000000
1053	FGM00041	ALBASIA FALCATA LAMINBOARD 15x780x3150	3.6855	PAK00097	PACKING TUMPUK 90	100	GPAK	100	Active	1	GKPP	Set	0.036900
1054	FGM00042	ALBASIA FALCATA LAMINBOARD 12x1250x2550	3.8250	FGM00047	FG LAMINBOARD 12x1250x2550	3.825	GPAK	100	Active	0	FGOD	m3	1.000000
1055	FGM00042	ALBASIA FALCATA LAMINBOARD 12x1250x2550	3.8250	PAK00097	PACKING TUMPUK 90	100	GPAK	100	Active	1	GKPP	Set	0.038300
1056	FGM00043	ALBASIA FALCATA LAMINBOARD 15x1250x2550	4.7813	FGM00048	FG LAMINBOARD 15x1250x2550	4.7813	GPAK	100	Active	0	FGOD	m3	1.000000
1057	FGM00043	ALBASIA FALCATA LAMINBOARD 15x1250x2550	4.7813	PAK00097	PACKING TUMPUK 90	100	GPAK	100	Active	1	GKPP	Set	0.047800
1058	FGM00059	ALBASIA FALCATA LAMINBOARD 38.1x914x3073	10.7012	FGM00069	LAMINBOARD 38.1x914x3073	10.7012	GPAK	100	Active	0	FGOD	m3	1.000000
1059	FGM00059	ALBASIA FALCATA LAMINBOARD 38.1x914x3073	10.7012	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.107000
1060	FGM00060	ALBASIA FALCATA LAMINBOARD 41.3x940x2464	9.5657	FGM00067	LAMINBOARD 41.3x940x2464	9.5657	GPAK	100	Active	0	FGOD	m3	1.000000
1061	FGM00060	ALBASIA FALCATA LAMINBOARD 41.3x940x2464	9.5657	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.095700
1062	FGM00061	ALBASIA FALCATA LAMINBOARD 41.3x940x3073	11.9300	FGM00065	LAMINBOARD 41.3x940x3073	11.93	GPAK	100	Active	0	FGOD	m3	1.000000
1063	FGM00061	ALBASIA FALCATA LAMINBOARD 41.3x940x3073	11.9300	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.119300
1064	FGM00062	ALBASIA FALCATA LAMINBOARD 41.3x1245x2464	12.6695	FGM00066	LAMINBOARD 41.3x1245x2464	12.6695	GPAK	100	Active	0	FGOD	m3	1.000000
1065	FGM00062	ALBASIA FALCATA LAMINBOARD 41.3x1245x2464	12.6695	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.126700
1066	FGM00063	ALBASIA FALCATA LAMINBOARD 41.3x1245x3073	15.8009	FGM00064	LAMINBOARD 41.3x1245x3073	15.8009	GPAK	100	Active	0	FGOD	m3	1.000000
1067	FGM00063	ALBASIA FALCATA LAMINBOARD 41.3x1245x3073	15.8009	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.158000
1068	FGM00069	LAMINBOARD WBP 38.1x914x3073	10.7012	FGL00244	LVL FJ STICK WBP 38x44x3073	12.845	PFIN	100	Active	0	VAF1	m3	0.833100
1069	FGM00069	LAMINBOARD WBP 38.1x914x3073	10.7012	SUP00002	LEM UL 172, BC 4.0	70	PFIN	100	Active	1	GKOP	kg	0.152900
1070	FGM00069	LAMINBOARD WBP 38.1x914x3073	10.7012	SUP00027	H-3, BC 4.0	3	PFIN	100	Active	2	GKOP	kg	3.567100
1071	FGM00069	LAMINBOARD WBP 38.1x914x3073	10.7012	SUP00026	MELAMINE, BC 4.0	0.9	PFIN	100	Active	3	GKOP	kg	11.890200
1072	FGM00071	ALBASIA FALCATA LAMINBOARD WBP 41.3x914x3073	11.6000	FGM00078	FG LAMINBOARD WBP 41.3x914x3073	11.6	GPAK	100	Active	0	FGOD	m3	1.000000
1073	FGM00071	ALBASIA FALCATA LAMINBOARD WBP 41.3x914x3073	11.6000	PAK00141	PACKING TUMPUK SEPATU 27	100	GPAK	100	Active	1	GKPP	Set	0.116000
1074	FGM00072	ALBASIA FALCATA LAMINBOARD WBP 41.3x914x2464	9.3012	FGM00081	FG LAMINBOARD WBP 41.3x914x2464	9.3012	GPAK	100	Active	0	FGOD	m3	1.000000
1075	FGM00072	ALBASIA FALCATA LAMINBOARD WBP 41.3x914x2464	9.3012	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.093000
1076	FGM00075	LAMINBOARD WBP 41.3x914x3073	11.6000	FGL00005	LVL MRE 37x1220x2440	18.72414	PFIN	100	Active	0	PFIN	m3	0.619500
1077	FGM00081	FG LAMINBOARD WBP 41.3x914x2464	9.3012	FGM00076	LAMINBOARD WBP 41.3x914x2464	9.3012	FGOD	100	Active	0	PFIN	m3	1.000000
1078	FGM00102	LAMINBOARD 38x914x2464	8.5580	FGL00303	LVL STICK WBP 38x43x2464	1.0065	PFIN	100	Active	0	VFIN	m3	8.502700
1079	FGM00102	LAMINBOARD 38x914x2464	8.5580	SUP00002	LEM UL 172, BC 4.0	30	PFIN	100	Active	1	GKOP	kg	0.285300
1080	FGM00102	LAMINBOARD 38x914x2464	8.5580	SUP00027	H-3, BC 4.0	0.1	PFIN	100	Active	2	GKOP	kg	85.580000
1081	FGM00102	LAMINBOARD 38x914x2464	8.5580	SUP00026	MELAMINE, BC 4.0	2	PFIN	100	Active	3	GKOP	kg	4.279000
1082	FGM00103	LAMINBOARD WBP 38.7x914x3073	10.8698	FGL00244	LVL FJ STICK WBP 38x44x3073	12.845	PFIN	100	Active	0	VAF1	m3	0.846200
1083	FGM00103	LAMINBOARD WBP 38.7x914x3073	10.8698	SUP00002	LEM UL 172, BC 4.0	70	PFIN	100	Active	1	GKOP	kg	0.155300
1084	FGM00103	LAMINBOARD WBP 38.7x914x3073	10.8698	SUP00027	H-3, BC 4.0	3	PFIN	100	Active	2	GKOP	kg	3.623300
1085	FGM00103	LAMINBOARD WBP 38.7x914x3073	10.8698	SUP00026	MELAMINE, BC 4.0	0.9	PFIN	100	Active	3	GKOP	kg	12.077600
1086	FGP00001	PLYWOOD F*4 3x1220x2440	0.8930	WIV00064	VENEER LG 1.3x1220x2440	0.774	PFIN	100	Active	0	WIVE	m3	1.153700
1087	FGP00001	PLYWOOD F*4 3x1220x2440	0.8930	WIV00015	VENEER SG 2x1220x2440	0.5954	PFIN	100	Active	1	WIVE	m3	1.499800
1088	FGP00001	PLYWOOD F*4 3x1220x2440	0.8930	SUP00075	PREMIX BONDTITE	200	PFIN	100	Active	2	SUPP	Kg	0.004500
1089	FGP00002	PLYWOOD 3.6x1220x2440	1.0716	WIV00064	VENEER LG 1.3x1220x2440	0.774	PFIN	100	Active	0	WIVE	m3	1.384500
1090	FGP00002	PLYWOOD 3.6x1220x2440	1.0716	WIV00015	VENEER SG 2x1220x2440	0.5954	PFIN	100	Active	1	WIVE	m3	1.799800
1091	FGP00002	PLYWOOD 3.6x1220x2440	1.0716	SUP00073	PREMIX UL	100	PFIN	100	Active	2	SUPP	Kg	0.010700
1092	FGP00003	PLYWOOD F4 4x1220x2440	1.1907	WIV00530	VENEER LG 1.3x1220x2500	0.793	PFIN	100	Active	0	GKOP	m3	1.501500
1093	FGP00003	PLYWOOD F4 4x1220x2440	1.1907	WIV00190	VENEER JOINT 2x1220x1220	0.2977	PFIN	100	Active	1	GKOP	m3	3.999700
1094	FGP00003	PLYWOOD F4 4x1220x2440	1.1907	SUP00080	PREMIX UL F*4	102.5	PFIN	100	Active	2	GKOP	Kg	0.011600
1095	FGP00004	PLYWOOD MRE 4x1220x2500	1.2200	WIV00530	VENEER LG 1.3x1220x2500	0.793	PFIN	100	Active	0	GKOP	m3	1.538500
1096	FGP00004	PLYWOOD MRE 4x1220x2500	1.2200	WIV00015	VENEER SG 2x1220x2440	0.5954	PFIN	100	Active	1	GKOP	m3	2.049000
1097	FGP00004	PLYWOOD MRE 4x1220x2500	1.2200	SUP00099	PREMIX MRE-0 1020	120	PFIN	100	Active	2	GKOP	Kg	0.010200
1098	FGP00006	PLYWOOD MRE 5x1220x2440	1.4884	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	2.440000
1099	FGP00006	PLYWOOD MRE 5x1220x2440	1.4884	WCP00059	CORE PLYWOOD MRE 3x1220x2440	0.893	PFIN	100	Active	1	WIPA	m3	1.666700
1100	FGP00006	PLYWOOD MRE 5x1220x2440	1.4884	SUP00099	PREMIX MRE-0 1020	102.5	PFIN	100	Active	2	GKOP	Kg	0.014500
1101	FGP00008	PLYWOOD 5x1250x2550	1.5938	WIV00070	VENEER LG 2x1220x2440	1.1908	PFIN	100	Active	0	WIVE	m3	1.338400
1102	FGP00008	PLYWOOD 5x1250x2550	1.5938	WIV00032	VENEER SG 2.6x1220x2440	0.774	PFIN	100	Active	1	WIVE	m3	2.059200
1103	FGP00008	PLYWOOD 5x1250x2550	1.5938	SUP00073	PREMIX UL	100	PFIN	100	Active	2	SUPP	Kg	0.015900
1104	FGP00009	PLYWOOD MRE 5.5x1220x2440	1.6372	WIV00070	VENEER LG 2x1220x2440	1.1908	PFIN	100	Active	0	GKOP	m3	1.374900
1105	FGP00009	PLYWOOD MRE 5.5x1220x2440	1.6372	WIV00015	VENEER SG 2x1220x2440	0.5954	PFIN	100	Active	1	GKOP	m3	2.749700
1106	FGP00009	PLYWOOD MRE 5.5x1220x2440	1.6372	SUP00073	PREMIX UL MRE-1	120	PFIN	100	Active	2	GKOP	Kg	0.013600
1107	FGP00011	PLYWOOD 6x1220x2440	1.7861	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	2.928000
1108	FGP00011	PLYWOOD 6x1220x2440	1.7861	WCP00082	CORE PLYWOOD MRE 4.3x1220x2440	1.28	PFIN	100	Active	1	WIPA	m3	1.395400
1109	FGP00011	PLYWOOD 6x1220x2440	1.7861	SUP00073	PREMIX UL MRE-1	120	PFIN	100	Active	2	GKOP	Kg	0.014900
1110	FGP00012	PLYWOOD MRE 6x1220x2500	1.8300	WIV00524	VENEER LG 2x1220x2500	1.22	PFIN	100	Active	0	GKOP	m3	1.500000
1111	FGP00012	PLYWOOD MRE 6x1220x2500	1.8300	WIV00032	VENEER SG 2.6x1220x2440	0.774	PFIN	100	Active	1	GKOP	m3	2.364300
1112	FGP00012	PLYWOOD MRE 6x1220x2500	1.8300	SUP00099	PREMIX MRE-0 1020	120	PFIN	100	Active	2	GKOP	Kg	0.015300
1113	FGP00014	PLYWOOD MRE 8x1220x2500	2.4400	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	4.000000
1114	FGP00014	PLYWOOD MRE 8x1220x2500	2.4400	WCP00136	CORE PLYWOOD MRE 6.3x1220x2500	1.9215	PFIN	100	Active	1	WIPA	m3	1.269800
1115	FGP00014	PLYWOOD MRE 8x1220x2500	2.4400	SUP00099	PREMIX MRE-0 1020	102.5	PFIN	100	Active	2	GKOP	Kg	0.023800
1116	FGP00015	PLYWOOD 9x990x1122	0.9997	WIV00011	VENEER SG 2x1220x1220	1.4885	PFIN	100	Active	0	WIVE	m3	0.671600
1117	FGP00015	PLYWOOD 9x990x1122	0.9997	SUP00073	PREMIX UL	200	PFIN	100	Active	1	SUPP	Kg	0.005000
1118	FGP00016	PLYWOOD 9x1065x1140	1.0927	FGP00021	PLYWOOD 9x1220x2440	1	PFIN	100	Active	0	PFIN	m3	1.092700
1119	FGP00017	PLYWOOD 9x1140x1140	1.0927	FGP00021	PLYWOOD 9x1220x2440	1	PFIN	100	Active	0	PFIN	m3	1.092700
1120	FGP00018	PLYWOOD 9x1220x1220	1.3396	WIV00011	VENEER SG 2x1220x1220	1.4885	PFIN	100	Active	0	WIVE	m3	0.900000
1121	FGP00018	PLYWOOD 9x1220x1220	1.3396	SUP00073	PREMIX UL	102.5	PFIN	100	Active	1	GKPP	Kg	0.013100
1122	FGP00021	PLYWOOD MRE 9x1220x2440	2.6791	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	4.392000
1123	FGP00021	PLYWOOD MRE 9x1220x2440	2.6791	WCP00077	CORE PLYWOOD MRE 7.3x1220x2440	2.1731	PFIN	100	Active	1	WIPA	m3	1.232800
1124	FGP00021	PLYWOOD MRE 9x1220x2440	2.6791	SUP00073	PREMIX UL MRE-1	102.5	PFIN	100	Active	2	GKOP	Kg	0.026100
1125	FGP00023	PLYWOOD MRE 10x1220x2440	2.9768	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	4.880000
1126	FGP00023	PLYWOOD MRE 10x1220x2440	2.9768	WCP00035	CORE PLYWOOD MRE 8.3x1220x2440	2.4707	PFIN	100	Active	1	WIPA	m3	1.204800
1127	FGP00023	PLYWOOD MRE 10x1220x2440	2.9768	SUP00099	PREMIX MRE-0 1020	211.8	PFIN	100	Active	2	GKOP	Kg	0.014100
1128	FGP00023	PLYWOOD MRE 10x1220x2440	2.9768	BTK-ASM	BTK COSTING ASSEMBLY	200	PFIN	100	Active	3	GKOP	Ply	0.014900
1129	FGP00024	PLYWOOD MRE 10x1220x2500	3.0500	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	5.000000
1130	FGP00024	PLYWOOD MRE 10x1220x2500	3.0500	WCP00128	CORE PLYWOOD MRE 8.3x1220x2500	2.5315	PFIN	100	Active	1	WIPA	m3	1.204800
1131	FGP00024	PLYWOOD MRE 10x1220x2500	3.0500	SUP00099	PREMIX MRE-0 1020	110	PFIN	100	Active	2	GKOP	Kg	0.027700
1132	FGP00027	PLYWOOD MRE 12x1220x2440	3.5722	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	5.856100
1133	FGP00027	PLYWOOD MRE 12x1220x2440	3.5722	WCP00076	CORE PLYWOOD MRE 10.3x1220x2440	3.0661	PFIN	100	Active	1	WIPA	m3	1.165100
1134	FGP00027	PLYWOOD MRE 12x1220x2440	3.5722	SUP00073	PREMIX UL MRE-1	120	PFIN	100	Active	2	GKOP	Kg	0.029800
1135	FGP00028	PLYWOOD MRE 12x1220x2500	3.6600	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	6.000000
1136	FGP00028	PLYWOOD MRE 12x1220x2500	3.6600	WCP00021	CORE PLYWOOD MRE 10x1220x2500	3.05	PFIN	100	Active	1	WIPA	m3	1.200000
1137	FGP00028	PLYWOOD MRE 12x1220x2500	3.6600	SUP00099	PREMIX MRE-0 1020	120	PFIN	100	Active	2	GKOP	Kg	0.030500
1138	FGP00029	PLYWOOD 12x1232x1842	2.7232	WCP00003	CORE PLYWOOD 7x1232x1842	1.5885	PFIN	100	Active	0	WIPA	m3	1.714300
1139	FGP00029	PLYWOOD 12x1232x1842	2.7232	RMM00012	MDF 2.5x1265x2485	1.5718	PFIN	100	Active	1	WADA	m3	1.732500
1140	FGP00029	PLYWOOD 12x1232x1842	2.7232	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.027500
1141	FGP00032	PLYWOOD MRE 15x1220x2440	4.4652	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	7.320000
1142	FGP00032	PLYWOOD MRE 15x1220x2440	4.4652	WCP00078	CORE PLYWOOD MRE 13.3x1220x2440	3.9591	PFIN	100	Active	1	WIPA	m3	1.127800
1143	FGP00032	PLYWOOD MRE 15x1220x2440	4.4652	SUP00073	PREMIX UL MRE-1	120	PFIN	100	Active	2	GKOP	Kg	0.037200
1144	FGP00033	PLYWOOD MRE 15x1220x2500	4.5750	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	7.500000
1145	FGP00033	PLYWOOD MRE 15x1220x2500	4.5750	WCP00134	CORE PLYWOOD MRE 13x1220x2500	3.965	PFIN	100	Active	1	WIPA	m3	1.153800
1146	FGP00033	PLYWOOD MRE 15x1220x2500	4.5750	SUP00099	PREMIX MRE-0 1020	110	PFIN	100	Active	2	GKOP	Kg	0.041600
1147	FGP00034	PLYWOOD MRE 18x1220x2440	5.3582	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	8.783900
1148	FGP00034	PLYWOOD MRE 18x1220x2440	5.3582	WCP00079	CORE PLYWOOD MRE 16.3x1220x2440	4.8522	PFIN	100	Active	1	WIPA	m3	1.104300
1149	FGP00034	PLYWOOD MRE 18x1220x2440	5.3582	SUP00073	PREMIX UL MRE-1	105.9	PFIN	100	Active	2	GKOP	Kg	0.050600
1150	FGP00035	PLYWOOD MRE 18x1220x2500	5.4900	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	9.000000
1151	FGP00035	PLYWOOD MRE 18x1220x2500	5.4900	WCP00079	CORE PLYWOOD MRE 16.3x1220x2440	4.8522	PFIN	100	Active	1	WIPA	m3	1.131400
1152	FGP00035	PLYWOOD MRE 18x1220x2500	5.4900	SUP00099	PREMIX MRE-0 1020	105.9	PFIN	100	Active	2	GKOP	Kg	0.051800
1153	FGP00038	PLYWOOD COATING 9x1220x2500	2.7450	WIV00070	VENEER LG 2x1220x2440	1.7862	PFIN	100	Active	0	WIVE	m3	1.536800
1154	FGP00038	PLYWOOD COATING 9x1220x2500	2.7450	WIV00015	VENEER SG 2x1220x2440	1.1908	PFIN	100	Active	1	WIVE	m3	2.305200
1155	FGP00038	PLYWOOD COATING 9x1220x2500	2.7450	SUP00073	PREMIX UL	200	PFIN	100	Active	2	SUPP	Kg	0.013700
1156	FGP00039	FG PLYWOOD WBP COATING 12x1220x2440	3.5722	FGP00682	FG PLYWOOD WBP 12x1220x2440	3.5722	PVAF	100	Active	0	FGOD	m3	1.000000
1157	FGP00039	FG PLYWOOD WBP COATING 12x1220x2440	3.5722	SUP00041	WAP-66611 BLACK ABSM NO. BATCH 17H2217822 (CAT SUPERFICI), BC 4.0	30	PVAF	100	Active	1	GKOP	kg	0.119100
1158	FGP00040	PLYWOOD COATING 12x1220x2500	3.6600	WIV00049	VENEER LG 1x1220x2440	0.5954	PFIN	100	Active	0	WIVE	m3	6.147100
1159	FGP00040	PLYWOOD COATING 12x1220x2500	3.6600	WCP00006	CORE PLYWOOD 13x1220x2440	3.8698	PFIN	100	Active	1	WIPA	m3	0.945800
1160	FGP00040	PLYWOOD COATING 12x1220x2500	3.6600	SUP00073	PREMIX UL	1	PFIN	100	Active	2	SUPP	Kg	3.660000
1161	FGP00041	PLYWOOD COATING 15x1220x2500	4.5750	WIV00064	VENEER LG 1.3x1220x2440	0.774	PFIN	100	Active	0	WIVE	m3	5.910900
1162	FGP00041	PLYWOOD COATING 15x1220x2500	4.5750	WCP00006	CORE PLYWOOD 13x1220x2440	3.8698	PFIN	100	Active	1	WIPA	m3	1.182200
1163	FGP00041	PLYWOOD COATING 15x1220x2500	4.5750	SUP00073	PREMIX UL	100	PFIN	100	Active	2	SUPP	Kg	0.045800
1164	FGP00042	PLYWOOD COATING 18x1220x2500	5.4900	WIV00049	VENEER LG 1x1220x2440	0.5954	PFIN	100	Active	0	WIVE	m3	9.220700
1165	FGP00042	PLYWOOD COATING 18x1220x2500	5.4900	WCP00007	CORE PLYWOOD 16x1220x2440	4.7629	PFIN	100	Active	1	WIPA	m3	1.152700
1166	FGP00042	PLYWOOD COATING 18x1220x2500	5.4900	SUP00073	PREMIX UL	100	PFIN	100	Active	2	SUPP	Kg	0.054900
1167	FGP00043	ALBASIA FALCATA PLYWOOD WBP 3x1220x2440	0.8930	FGP00440	FG PLYWOOD WBP 3x1220x2440	0.893	GPAK	100	Active	0	FGOD	m3	1.000000
1168	FGP00043	ALBASIA FALCATA PLYWOOD WBP 3x1220x2440	0.8930	PAK00073	PACKING TUMPUK 280	100	GPAK	100	Active	1	GKPP	Set	0.008900
1169	FGP00044	ALBASIA FALCATA PLYWOOD 3.6x1220x2440	1.0716	FGP00002	PLYWOOD WBP 3.6x1220x2440	1.0716	GPAK	100	Active	0	FGOD	m3	1.000000
1170	FGP00044	ALBASIA FALCATA PLYWOOD 3.6x1220x2440	1.0716	PAK00088	PACKING TUMPUK 180	100	GPAK	100	Active	1	GKPP	Set	0.010700
1171	FGP00045	ALBASIA FALCATA PLYWOOD WBP 4x1220x2440	1.1907	FGP00829	FG PLYWOOD F4 4X1220X2440	1.1907	GPAK	100	Active	0	FGOD	m3	1.000000
1172	FGP00045	ALBASIA FALCATA PLYWOOD WBP 4x1220x2440	1.1907	PAK00088	PACKING TUMPUK 180	100	GPAK	100	Active	1	GKPP	Set	0.011900
1173	FGP00046	ALBASIA FALCATA PLYWOOD MRE 4x1220x2500	1.2200	FGP00222	FG PLYWOOD MRE 4x1220x2500	1.22	GPAK	100	Active	0	FGOD	m3	1.000000
1174	FGP00046	ALBASIA FALCATA PLYWOOD MRE 4x1220x2500	1.2200	PAK00088	PACKING TUMPUK 180	100	GPAK	100	Active	1	GKPP	Set	0.012200
1175	FGP00047	ALBASIA FALCATA PLYWOOD 4x1270x2530	1.2852	FGP00005	PLYWOOD 4x1270x2530	1.2852	GPAK	100	Active	0	FGOD	m3	1.000000
1176	FGP00047	ALBASIA FALCATA PLYWOOD 4x1270x2530	1.2852	PAK00088	PACKING TUMPUK 180	100	GPAK	100	Active	1	GKPP	Set	0.012900
1177	FGP00048	ALBASIA FALCATA PLYWOOD MRE 5x1220x2440	1.4884	FGP00719	FG PLYWOOD MRE 5x1220x2440	1.4884	GPAK	100	Active	0	FGOD	m3	1.000000
1178	FGP00048	ALBASIA FALCATA PLYWOOD MRE 5x1220x2440	1.4884	PAK00075	PACKING TUMPUK 150	100	GPAK	100	Active	1	GKPP	Set	0.014900
1179	FGP00049	ALBASIA FALCATA PLYWOOD MRE 5x1220x2500	1.5250	FGP00223	FG PLYWOOD MRE 5x1220x2500	1.525	GPAK	100	Active	0	FGOD	m3	1.000000
1180	FGP00049	ALBASIA FALCATA PLYWOOD MRE 5x1220x2500	1.5250	PAK00091	PACKING TUMPUK 144	100	GPAK	100	Active	1	GKPP	Set	0.015300
1181	FGP00050	ALBASIA FALCATA PLYWOOD 5x1250x2550	1.5938	FGP00008	PLYWOOD 5x1250x2550	1.5938	GPAK	100	Active	0	FGOD	m3	1.000000
1182	FGP00050	ALBASIA FALCATA PLYWOOD 5x1250x2550	1.5938	PAK00091	PACKING TUMPUK 144	100	GPAK	100	Active	1	GKPP	Set	0.015900
1183	FGP00051	ALBASIA FALCATA PLYWOOD MRE 5.5x1220x2440	1.6372	FGP00327	FG PLYWOOD MRE 5.5x1220x2440	1.6372	GPAK	100	Active	0	FGOD	m3	1.000000
1184	FGP00051	ALBASIA FALCATA PLYWOOD MRE 5.5x1220x2440	1.6372	PAK00075	PACKING TUMPUK 150	100	GPAK	100	Active	1	GKPP	Set	0.016400
1185	FGP00052	ALBASIA FALCATA PLYWOOD 6x1220x2300	1.6836	FGP00010	PLYWOOD 6x1220x2300	1.6836	GPAK	100	Active	0	FGOD	m3	1.000000
1186	FGP00052	ALBASIA FALCATA PLYWOOD 6x1220x2300	1.6836	PAK00075	PACKING TUMPUK 150	100	GPAK	100	Active	1	GKPP	Set	0.016800
1187	FGP00053	ALBASIA FALCATA PLYWOOD MRE 6x1220x2440	1.7861	FGP00225	FG PLYWOOD MRE 6x1220x2440	1.7861	GPAK	100	Active	0	FGOD	m3	1.000000
1188	FGP00053	ALBASIA FALCATA PLYWOOD MRE 6x1220x2440	1.7861	PAK00075	PACKING TUMPUK 150	100	GPAK	100	Active	1	GKPP	Set	0.017900
1189	FGP00054	ALBASIA FALCATA PLYWOOD MRE 6x1220x2500	1.8300	FGP00257	FG PLYWOOD MRE 6x1220x2500	1.83	GPAK	100	Active	0	FGOD	m3	1.000000
1190	FGP00054	ALBASIA FALCATA PLYWOOD MRE 6x1220x2500	1.8300	PAK00094	PACKING TUMPUK 120	100	GPAK	100	Active	1	GKPP	Set	0.018300
1191	FGP00055	ALBASIA FALCATA PLYWOOD 6x1270x2530	1.9279	FGP00013	PLYWOOD 6x1270x2530	1.9279	GPAK	100	Active	0	FGOD	m3	1.000000
1192	FGP00055	ALBASIA FALCATA PLYWOOD 6x1270x2530	1.9279	PAK00075	PACKING TUMPUK 150	100	GPAK	100	Active	1	GKPP	Set	0.019300
1193	FGP00056	ALBASIA FALCATA PLYWOOD MRE 8x1220x2500	2.4400	FGP00754	FG PLYWOOD MRE 8x1220x2500	2.44	GPAK	100	Active	0	FGOD	m3	1.000000
1194	FGP00056	ALBASIA FALCATA PLYWOOD MRE 8x1220x2500	2.4400	PAK00097	PACKING TUMPUK 90	100	GPAK	100	Active	1	GKPP	Set	0.024400
1195	FGP00057	ALBASIA FALCATA PLYWOOD MRE 9x990x1122	0.9997	FGP00229	FG PLYWOOD MRE 9x990x1122	0.9997	GPAK	100	Active	0	FGOD	m3	1.000000
1196	FGP00057	ALBASIA FALCATA PLYWOOD MRE 9x990x1122	0.9997	PAK00147	PACKING PNC 122	100	GPAK	100	Active	1	GKPP	Set	0.010000
1197	FGP00058	ALBASIA FALCATA PLYWOOD MRE 9x1065x1140	1.0927	FGP00227	FG PLYWOOD MRE 9x1065x1140	1.0927	GPAK	100	Active	0	FGOD	m3	1.000000
1198	FGP00058	ALBASIA FALCATA PLYWOOD MRE 9x1065x1140	1.0927	PAK00147	PACKING PNC 122	100	GPAK	100	Active	1	GKPP	Set	0.010900
1199	FGP00059	ALBASIA FALCATA PLYWOOD MRE 9x1140x1140	1.1696	FGP00228	FG PLYWOOD MRE 9x1140x1140	1.1696	GPAK	100	Active	0	FGOD	m3	1.000000
1200	FGP00059	ALBASIA FALCATA PLYWOOD MRE 9x1140x1140	1.1696	PAK00147	PACKING PNC 122	100	GPAK	100	Active	1	GKPP	Set	0.011700
1201	FGP00060	ALBASIA FALCATA PLYWOOD 9x1220x1220	1.3396	FGP00018	PLYWOOD MRE 9x1220x1220	1.3396	GPAK	100	Active	0	FGOD	m3	1.000000
1202	FGP00060	ALBASIA FALCATA PLYWOOD 9x1220x1220	1.3396	PAK00076	PACKING TUMPUK 100	100	GPAK	100	Active	1	GKPP	Set	0.013400
1203	FGP00061	ALBASIA FALCATA PLYWOOD 9x1220x2200	2.4156	FGP00019	PLYWOOD 9x1220x2200	2.4156	GPAK	100	Active	0	FGOD	m3	1.000000
1204	FGP00061	ALBASIA FALCATA PLYWOOD 9x1220x2200	2.4156	PAK00100	PACKING TUMPUK P.2500/80	100	GPAK	100	Active	1	GKPP	Set	0.024200
1205	FGP00063	ALBASIA FALCATA PLYWOOD MRE 9x1220x2440	2.6791	FGP00330	FG PLYWOOD MRE 9x1220x2440	2.6791	GPAK	100	Active	0	FGOD	m3	1.000000
1206	FGP00063	ALBASIA FALCATA PLYWOOD MRE 9x1220x2440	2.6791	PAK00076	PACKING TUMPUK 100	100	GPAK	100	Active	1	GKPP	Set	0.026800
1207	FGP00064	ALBASIA FALCATA PLYWOOD MRE 9x1220x2500	2.7450	FGP00359	FG PLYWOOD MRE 9x1220x2500	2.745	GPAK	100	Active	0	FGOD	m3	1.000000
1208	FGP00064	ALBASIA FALCATA PLYWOOD MRE 9x1220x2500	2.7450	PAK00100	PACKING TUMPUK P.2500/80	100	GPAK	100	Active	1	GKPP	Set	0.027500
1209	FGP00065	ALBASIA FALCATA PLYWOOD MRE 10x1220x2440	2.9768	FGP00265	FG PLYWOOD MRE 10x1220x2440	2.9768	GPAK	100	Active	0	FGOD	m3	1.000000
1210	FGP00065	ALBASIA FALCATA PLYWOOD MRE 10x1220x2440	2.9768	PAK00103	PACKING TUMPUK 73	100	GPAK	100	Active	1	GKPP	Set	0.029800
1211	FGP00066	ALBASIA FALCATA PLYWOOD MRE 10x1220x2500	3.0500	FGP00213	FG PLYWOOD MRE 10x1220x2500	1	GPAK	100	Active	0	FGOD	m3	3.050000
1212	FGP00066	ALBASIA FALCATA PLYWOOD MRE 10x1220x2500	3.0500	PAK00103	PACKING TUMPUK 73	100	GPAK	100	Active	1	GKPP	Set	0.030500
1213	FGP00067	ALBASIA FALCATA PLYWOOD 11x1220x2440	3.2745	FGP00025	PLYWOOD 11x1220x2440	3.2745	GPAK	100	Active	0	FGOD	m3	1.000000
1214	FGP00067	ALBASIA FALCATA PLYWOOD 11x1220x2440	3.2745	PAK00103	PACKING TUMPUK 73	100	GPAK	100	Active	1	GKPP	Set	0.032700
1215	FGP00068	ALBASIA FALCATA PLYWOOD 12x1220x1220	1.7861	FGP00026	PLYWOOD 12x1220x1220	1.7861	GPAK	100	Active	0	FGOD	m3	1.000000
1216	FGP00068	ALBASIA FALCATA PLYWOOD 12x1220x1220	1.7861	PAK00077	PACKING TUMPUK 80	100	GPAK	100	Active	1	GKPP	Set	0.017900
1217	FGP00069	ALBASIA FALCATA PLYWOOD MRE 12x1220x2440	3.5722	FGP00212	FG PLYWOOD MRE 12x1220x2440	3.5722	GPAK	100	Active	0	FGOD	m3	1.000000
1218	FGP00069	ALBASIA FALCATA PLYWOOD MRE 12x1220x2440	3.5722	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.035700
1219	FGP00070	ALBASIA FALCATA PLYWOOD MRE 12x1220x2500	3.6600	FGP00214	FG PLYWOOD MRE 12x1220x2500	3.66	GPAK	100	Active	0	FGOD	m3	1.000000
1220	FGP00070	ALBASIA FALCATA PLYWOOD MRE 12x1220x2500	3.6600	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.036600
1221	FGP00071	ALBASIA FALCATA PLYWOOD 12x1232x1842	2.7232	FGP00029	PLYWOOD 12x1232x1842	2.7232	GPAK	100	Active	0	FGOD	m3	1.000000
1222	FGP00071	ALBASIA FALCATA PLYWOOD 12x1232x1842	2.7232	PAK00077	PACKING TUMPUK 80	100	GPAK	100	Active	1	GKPP	Set	0.027200
1223	FGP00072	ALBASIA FALCATA PLYWOOD WBP 12x1232x2451	3.6236	FGP00291	FG PLYWOOD 12x1232x2451	3.6236	GPAK	100	Active	0	FGOD	m3	1.000000
1224	FGP00072	ALBASIA FALCATA PLYWOOD WBP 12x1232x2451	3.6236	PAK00103	PACKING TUMPUK 73	100	GPAK	100	Active	1	GKPP	Set	0.036200
1225	FGP00074	ALBASIA FALCATA PLYWOOD MRE 15x1220x2440	4.4652	FGP00276	FG PLYWOOD MRE 15x1220x2440	4.4652	GPAK	100	Active	0	FGOD	m3	1.000000
1226	FGP00074	ALBASIA FALCATA PLYWOOD MRE 15x1220x2440	4.4652	PAK00134	PACKING BERDIRI 68	100	GPAK	100	Active	1	GKPP	Set	0.044700
1227	FGP00075	ALBASIA FALCATA PLYWOOD MRE 15x1220x2500	4.5750	FGP00217	FG PLYWOOD MRE 15x1220x2500	4.575	GPAK	100	Active	0	FGOD	m3	1.000000
1228	FGP00075	ALBASIA FALCATA PLYWOOD MRE 15x1220x2500	4.5750	PAK00109	PACKING TUMPUK 49	100	GPAK	100	Active	1	GKPP	Set	0.045800
1229	FGP00076	ALBASIA FALCATA PLYWOOD MRE 18x1220x2440	5.3582	FGP00218	FG PLYWOOD MRE 18x1220x2440	5.3582	GPAK	100	Active	0	FGOD	m3	1.000000
1230	FGP00076	ALBASIA FALCATA PLYWOOD MRE 18x1220x2440	5.3582	PAK00111	PACKING BERDIRI 49	100	GPAK	100	Active	1	GKPP	Set	0.053600
1231	FGP00077	ALBASIA FALCATA PLYWOOD MRE 18x1220x2500	5.4900	FGP00219	FG PLYWOOD MRE 18x1220x2500	5.49	GPAK	100	Active	0	FGOD	m3	1.000000
1232	FGP00077	ALBASIA FALCATA PLYWOOD MRE 18x1220x2500	5.4900	PAK00145	PACKING MIRING 52	100	GPAK	100	Active	1	GKPP	Set	0.054900
1233	FGP00078	ALBASIA FALCATA PLYWOOD WBP 18x1232x2451	5.4353	FGP00259	FG PLYWOOD WBP 18x1232x2451	5.4353	GPAK	100	Active	0	FGOD	m3	1.000000
1234	FGP00078	ALBASIA FALCATA PLYWOOD WBP 18x1232x2451	5.4353	PAK00112	PACKING TUMPUK 41	100	GPAK	100	Active	1	GKPP	Set	0.054400
1235	FGP00079	ALBASIA FALCATA PLYWOOD 19x1232x2451	5.7373	FGP00037	PLYWOOD 19x1232x2451	5.7373	GPAK	100	Active	0	FGOD	m3	1.000000
1236	FGP00079	ALBASIA FALCATA PLYWOOD 19x1232x2451	5.7373	PAK00112	PACKING TUMPUK 41	100	GPAK	100	Active	1	GKPP	Set	0.057400
1237	FGP00080	ALBASIA FALCATA PLYWOOD COATING 9x1220x2500	2.7450	FGP00038	PLYWOOD COATING 9x1220x2500	2.745	GPAK	100	Active	0	FGOD	m3	1.000000
1238	FGP00080	ALBASIA FALCATA PLYWOOD COATING 9x1220x2500	2.7450	PAK00100	PACKING TUMPUK P.2500/80	100	GPAK	100	Active	1	GKPP	Set	0.027500
1239	FGP00081	ALBASIA FALCATA PLYWOOD WBP COATING 12x1220x2440	3.5722	FGP00039	FG PLYWOOD WBP COATING 12x1220x2440	1	GPAK	100	Active	0	PVAF	m3	3.572200
1240	FGP00081	ALBASIA FALCATA PLYWOOD WBP COATING 12x1220x2440	3.5722	PAK00144	PACKING MIRING 70	100	GPAK	100	Active	1	GKPP	Set	0.035700
1241	FGP00082	ALBASIA FALCATA PLYWOOD COATING 12x1220x2500	3.6600	FGP00040	PLYWOOD COATING 12x1220x2500	3.66	GPAK	100	Active	0	FGOD	m3	1.000000
1242	FGP00082	ALBASIA FALCATA PLYWOOD COATING 12x1220x2500	3.6600	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.036600
1243	FGP00083	ALBASIA FALCATA PLYWOOD COATING 15x1220x2500	4.5750	FGP00041	PLYWOOD COATING 15x1220x2500	4.575	GPAK	100	Active	0	FGOD	m3	1.000000
1244	FGP00083	ALBASIA FALCATA PLYWOOD COATING 15x1220x2500	4.5750	PAK00109	PACKING TUMPUK 49	100	GPAK	100	Active	1	GKPP	Set	0.045800
1245	FGP00084	ALBASIA FALCATA PLYWOOD COATING 18x1220x2500	5.4900	FGP00042	PLYWOOD COATING 18x1220x2500	5.49	GPAK	100	Active	0	FGOD	m3	1.000000
1246	FGP00084	ALBASIA FALCATA PLYWOOD COATING 18x1220x2500	5.4900	PAK00112	PACKING TUMPUK 41	100	GPAK	100	Active	1	GKPP	Set	0.054900
1247	FGP00085	PLYWOOD MRE 2.7x1220x2440	0.8037	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	1.317500
1248	FGP00085	PLYWOOD MRE 2.7x1220x2440	0.8037	WIV00005	VENEER SG 1.3x1220x2440	0.387	PFIN	100	Active	1	GKOP	m3	2.076700
1249	FGP00085	PLYWOOD MRE 2.7x1220x2440	0.8037	SUP00099	PREMIX MRE-0 1020	105.9	PFIN	100	Active	2	GKOP	Kg	0.007600
1250	FGP00086	PLYWOOD 3x1232x2451	0.9059	WIV00301	VENEER SG 1x1220x2440	0.2977	PFIN	100	Active	0	WIVE	m3	3.043000
1251	FGP00086	PLYWOOD 3x1232x2451	0.9059	WIV00064	VENEER LG 1.3x1220x2440	0.774	PFIN	100	Active	1	WIVE	m3	1.170400
1252	FGP00086	PLYWOOD 3x1232x2451	0.9059	SUP00073	PREMIX UL	100	PFIN	100	Active	2	GKOP	Kg	0.009100
1253	FGP00087	PLYWOOD 4x1232x2451	1.2079	WIV00064	VENEER LG 1.3x1220x2440	0.774	PFIN	100	Active	0	WIVE	m3	1.560600
1254	FGP00087	PLYWOOD 4x1232x2451	1.2079	WIV00032	VENEER SG 2.6x1220x2440	0.774	PFIN	100	Active	1	WIVE	m3	1.560600
1255	FGP00087	PLYWOOD 4x1232x2451	1.2079	SUP00073	PREMIX UL	100	PFIN	100	Active	2	SUPP	Kg	0.012100
1256	FGP00089	PLYWOOD MRE 21x1220x2440	6.2513	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	10.248000
1257	FGP00089	PLYWOOD MRE 21x1220x2440	6.2513	WCP00023	CORE PLYWOOD MRE 19x1220x2440	5.6559	PFIN	100	Active	1	WIPA	m3	1.105300
1258	FGP00089	PLYWOOD MRE 21x1220x2440	6.2513	SUP00073	PREMIX UL MRE-1	102.5	PFIN	100	Active	2	GKOP	Kg	0.061000
1259	FGP00094	ALBASIA FALCATA PLYWOOD MRE 2.7x1220x2440	0.8037	FGP00353	FG PLYWOOD MRE 2.7x1220x2440	0.8037	GPAK	100	Active	0	FGOD	m3	1.000000
1260	FGP00094	ALBASIA FALCATA PLYWOOD MRE 2.7x1220x2440	0.8037	PAK00074	PACKING TUMPUK 210	100	GPAK	100	Active	1	GKPP	Set	0.008000
1261	FGP00095	ALBASIA FALCATA PLYWOOD WBP 3x1232x2451	0.9059	FGP00258	FG PLYWOOD WBP 3x1232x2451	0.9059	GPAK	100	Active	0	FGOD	m3	1.000000
1262	FGP00095	ALBASIA FALCATA PLYWOOD WBP 3x1232x2451	0.9059	PAK00074	PACKING TUMPUK 210	100	GPAK	100	Active	1	GKPP	Set	0.009100
1263	FGP00096	ALBASIA FALCATA PLYWOOD 4x1232x2451	1.2079	FGP00087	PLYWOOD 4x1232x2451	1.2079	GPAK	100	Active	0	FGOD	m3	1.000000
1264	FGP00096	ALBASIA FALCATA PLYWOOD 4x1232x2451	1.2079	PAK00088	PACKING TUMPUK 180	100	GPAK	100	Active	1	GKPP	Set	0.012100
1265	FGP00097	ALBASIA FALCATA PLYWOOD MRE 20x1220x2500	6.1000	FGP00529	FG PLYWOOD 20x1220x2500	6.1	GPAK	100	Active	0	FGOD	m3	1.000000
1266	FGP00097	ALBASIA FALCATA PLYWOOD MRE 20x1220x2500	6.1000	PAK00088	PACKING TUMPUK 180	100	GPAK	100	Active	1	GKPP	Set	0.061000
1267	FGP00098	ALBASIA FALCATA PLYWOOD MRE 21x1220x2440	6.2513	FGP00402	FG PLYWOOD MRE 21x1220x2440	6.2513	GPAK	100	Active	0	FGOD	m3	1.000000
1268	FGP00098	ALBASIA FALCATA PLYWOOD MRE 21x1220x2440	6.2513	PAK00080	PACKING TUMPUK 42	100	GPAK	100	Active	1	GKPP	Set	0.062500
1269	FGP00100	ALBASIA FALCATA PLYWOOD MRE 30x1220x2500	9.1500	FGP00221	FG PLYWOOD 30x1220x2500	9.15	GPAK	100	Active	0	FGOD	m3	1.000000
1270	FGP00100	ALBASIA FALCATA PLYWOOD MRE 30x1220x2500	9.1500	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.091500
1271	FGP00101	ALBASIA FALCATA PLYWOOD 17.5x1232x2451	5.2844	FGP00092	PLYWOOD 17.5x1232x2451	5.2844	GPAK	100	Active	0	FGOD	m3	1.000000
1272	FGP00101	ALBASIA FALCATA PLYWOOD 17.5x1232x2451	5.2844	PAK00109	PACKING TUMPUK 49	100	GPAK	100	Active	1	GKPP	Set	0.052800
1273	FGP00104	ALBASIA FALCATA PLYWOOD 12x589x1980	1.3995	FGP00109	PLYWOOD 12x589x1980	1.3995	GPAK	100	Active	0	FGOD	m3	1.000000
1274	FGP00104	ALBASIA FALCATA PLYWOOD 12x589x1980	1.3995	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.014000
1275	FGP00105	ALBASIA FALCATA PLYWOOD 12x589x2200	1.5550	FGP00110	PLYWOOD 12x589x2200	1.555	GPAK	100	Active	0	FGOD	m3	1.000000
1276	FGP00105	ALBASIA FALCATA PLYWOOD 12x589x2200	1.5550	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.015600
1277	FGP00106	ALBASIA FALCATA PLYWOOD 12x694x2200	1.8322	FGP00112	PLYWOOD 12x694x2200	1.8322	GPAK	100	Active	0	FGOD	m3	1.000000
1278	FGP00106	ALBASIA FALCATA PLYWOOD 12x694x2200	1.8322	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.018300
1279	FGP00107	ALBASIA FALCATA PLYWOOD 12x694x2000	1.6656	FGP00111	PLYWOOD 12x694x2000	1.6656	GPAK	100	Active	0	FGOD	m3	1.000000
1280	FGP00107	ALBASIA FALCATA PLYWOOD 12x694x2000	1.6656	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.016700
1281	FGP00109	PLYWOOD 12x589x1980	1.3995	WIV00218	VENEER LG 1.3x770x2300	0.4604	PFIN	100	Active	0	WIVE	m3	3.039700
1282	FGP00109	PLYWOOD 12x589x1980	1.3995	WCP00014	CORE PLYWOOD 10x694x2000	1.388	PFIN	100	Active	1	WIPA	m3	1.008300
1283	FGP00109	PLYWOOD 12x589x1980	1.3995	SUP00073	PREMIX UL	100	PFIN	100	Active	2	SUPP	Kg	0.014000
1284	FGP00111	PLYWOOD 12x694x2000	1.6656	WIV00218	VENEER LG 1.3x770x2300	0.4604	PFIN	100	Active	0	WIVE	m3	3.617700
1285	FGP00111	PLYWOOD 12x694x2000	1.6656	WCP00013	CORE PLYWOOD 10x694x2200	1.5268	PFIN	100	Active	1	WIPA	m3	1.090900
1286	FGP00111	PLYWOOD 12x694x2000	1.6656	SUP00073	PREMIX UL	100	PFIN	100	Active	2	SUPP	Kg	0.016700
1287	FGP00113	PLYWOOD 12x739x2200	1.9510	WIV00220	VENEER LG 1.3x830x2300	0.4964	PFIN	100	Active	0	WIVE	m3	3.930300
1288	FGP00113	PLYWOOD 12x739x2200	1.9510	WCP00010	CORE PLYWOOD 10x739x2200	1.6258	PFIN	100	Active	1	WIPA	m3	1.200000
1289	FGP00113	PLYWOOD 12x739x2200	1.9510	SUP00073	PREMIX UL	100	PFIN	100	Active	2	SUPP	Kg	0.019500
1290	FGP00117	PLYWOOD 9x990x1220	1.0870	WIV00008	VENEER SG 2x930x2150	0.3199	PFIN	100	Active	0	WIVE	m3	3.397900
1291	FGP00117	PLYWOOD 9x990x1220	1.0870	SUP00073	PREMIX UL	200	PFIN	100	Active	1	SUPP	Kg	0.005400
1292	FGP00117	PLYWOOD 9x990x1220	1.0870	WIV00061	VENEER LG 1.3x930x2200	0.9709	PFIN	100	Active	5	WIVE	m3	1.119600
1293	FGP00118	PLYWOOD 12x739x2190	1.9421	WIV00223	VENEER LG 1.7x770x2200	0.576	PFIN	100	Active	0	WIVE	m3	3.371700
1294	FGP00118	PLYWOOD 12x739x2190	1.9421	WCP00010	CORE PLYWOOD 10x739x2200	1.6258	PFIN	100	Active	1	WIPA	m3	1.194600
1295	FGP00118	PLYWOOD 12x739x2190	1.9421	SUP00079	PREMIX UL MRE-0	102.5	PFIN	100	Active	2	GKOP	Kg	0.018900
1296	FGP00119	ALBASIA FALCATA PLYWOOD MRE 12x739x2190	1.9421	FGP00245	FG PLYWOOD MRE 12x739x2190	1.9421	GPAK	100	Active	0	FGOD	m3	1.000000
1297	FGP00119	ALBASIA FALCATA PLYWOOD MRE 12x739x2190	1.9421	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.019400
1298	FGP00120	PLYWOOD 12x694x2190	1.8238	WIV00299	VENEER LG 1.3x770x2200	0.4404	PFIN	100	Active	0	WIVE	m3	4.141200
1299	FGP00120	PLYWOOD 12x694x2190	1.8238	WIV00279	VENEER SG 2x770x2200	1.0164	PFIN	100	Active	1	WIVE	m3	1.794400
1300	FGP00120	PLYWOOD 12x694x2190	1.8238	SUP00079	PREMIX UL MRE-0	200	PFIN	100	Active	2	GKOP	Kg	0.009100
1301	FGP00121	ALBASIA FALCATA PLYWOOD MRE 12x694x2190	1.8238	FGP00210	FG PLYWOOD MRE 12x694x2190	1.8238	GPAK	100	Active	0	FGOD	m3	1.000000
1302	FGP00121	ALBASIA FALCATA PLYWOOD MRE 12x694x2190	1.8238	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.018200
1303	FGP00122	PLYWOOD 12x589x2185	1.5444	WIV00293	VENEER LG 2x770x2200	0.6776	PFIN	100	Active	0	WIVE	m3	2.279200
1304	FGP00122	PLYWOOD 12x589x2185	1.5444	WCP00014	CORE PLYWOOD 10x694x1990	1.3811	PFIN	100	Active	1	WIPA	m3	1.118200
1305	FGP00122	PLYWOOD 12x589x2185	1.5444	SUP00099	PREMIX MRE-0 1020	102.5	PFIN	100	Active	2	GKOP	Kg	0.015100
1306	FGP00123	ALBASIA FALCATA PLYWOOD MRE 12x589x2185	1.5444	FGP00215	FG PLYWOOD MRE 12x589x2185	1.5444	GPAK	100	Active	0	FGOD	m3	1.000000
1307	FGP00123	ALBASIA FALCATA PLYWOOD MRE 12x589x2185	1.5444	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.015400
1308	FGP00124	PLYWOOD 12x694x1990	1.6573	WCP00030	CORE PLYWOOD 9x694x1990	1	PFIN	100	Active	0	WIPA	m3	1.657300
1309	FGP00124	PLYWOOD 12x694x1990	1.6573	WIV00287	VENEER LG 1.7x770x2000	0.5236	PFIN	100	Active	1	WIVE	m3	3.165200
1310	FGP00124	PLYWOOD 12x694x1990	1.6573	SUP00079	PREMIX UL MRE-0	100	PFIN	100	Active	2	SUPP	Kg	0.016600
1311	FGP00125	ALBASIA FALCATA PLYWOOD MRE 12x694x1990	1.6573	FGP00124	PLYWOOD MRE 12x694x1990	1.6573	GPAK	100	Active	0	FGOD	m3	1.000000
1312	FGP00125	ALBASIA FALCATA PLYWOOD MRE 12x694x1990	1.6573	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.016600
1313	FGP00126	PLYWOOD 12x649x1980	1.5420	WCP00030	CORE PLYWOOD 9x694x1990	1.243	PFIN	100	Active	0	WIPA	m3	1.240500
1314	FGP00126	PLYWOOD 12x649x1980	1.5420	WIV00287	VENEER LG 1.7x770x2200	0.5236	PFIN	100	Active	1	WIVE	m3	2.945000
1315	FGP00126	PLYWOOD 12x649x1980	1.5420	SUP00073	PREMIX UL	100	PFIN	100	Active	2	SUPP	Kg	0.015400
1316	FGP00127	ALBASIA FALCATA PLYWOOD 12x649x1980	1.5420	FGP00126	PLYWOOD MRE 12x649x1980	1.542	GPAK	100	Active	0	FGOD	m3	1.000000
1317	FGP00127	ALBASIA FALCATA PLYWOOD 12x649x1980	1.5420	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.015400
1318	FGP00129	ALBASIA FALCATA PLYWOOD 12x1220x1990	2.9134	FGP00128	PLYWOOD MRE 12x1220x1990	2.9134	GPAK	100	Active	0	FGOD	m3	1.000000
1319	FGP00129	ALBASIA FALCATA PLYWOOD 12x1220x1990	2.9134	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.029100
1320	FGP00142	ALBASIA FALCATA PLYWOOD MDF 12x1245x2464	3.6812	FGP00190	PLYWOOD MDF WBP 12x1245x2464	3.6812	GPAK	100	Active	0	FGOD	m3	1.000000
1321	FGP00142	ALBASIA FALCATA PLYWOOD MDF 12x1245x2464	3.6812	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.036800
1322	FGP00144	ALBASIA FALCATA PLYWOOD MDF WBP 18x1220x2440	5.3582	FGP00808	FG PLYWOOD MDF WBP 18x1220x2440	5.3582	GPAK	100	Active	0	FGOD	m3	1.000000
1323	FGP00144	ALBASIA FALCATA PLYWOOD MDF WBP 18x1220x2440	5.3582	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.053600
1324	FGP00146	ALBASIA FALCATA PLYWOOD MRE 25X1220X2500	7.6250	FGP00220	FG PLYWOOD MRE 25x1220x2500	7.625	GPAK	100	Active	0	FGOD	m3	1.000000
1325	FGP00146	ALBASIA FALCATA PLYWOOD MRE 25X1220X2500	7.6250	PAK00121	PACKING TUMPUK 30	100	GPAK	100	Active	1	GKPP	Set	0.076300
1326	FGP00150	ALBASIA FALCATA PLYWOOD MDF 17.5x1245x2464	5.3684	FGP00246	FG PLYWOOD WBP 17.5x1245x2464	5.3684	GPAK	100	Active	0	FGOD	m3	1.000000
1327	FGP00150	ALBASIA FALCATA PLYWOOD MDF 17.5x1245x2464	5.3684	PAK00135	PACKING BERDIRI 57	100	GPAK	100	Active	1	GKPP	Set	0.053700
1328	FGP00151	PLYWOOD MDF WBP 17.5x1245x2464	5.3684	RMM00020	MDF 2.5x1232x2781	1.713	PFIN	100	Active	0	GKOP	m3	3.133900
1329	FGP00151	PLYWOOD MDF WBP 17.5x1245x2464	5.3684	WCP00020	CORE PLYWOOD WBP 13.1x1220x2440	1	PFIN	100	Active	1	WIPA	m3	5.368400
1330	FGP00151	PLYWOOD MDF WBP 17.5x1245x2464	5.3684	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.054200
1331	FGP00155	ALBASIA FALCATA PLYWOOD 12x1232x2464	3.6428	FGP00153	PLYWOOD 12x1232x2464	3.6428	GPAK	100	Active	0	FGOD	m3	1.000000
1332	FGP00155	ALBASIA FALCATA PLYWOOD 12x1232x2464	3.6428	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.036400
1333	FGP00157	ALBASIA FALCATA PLYWOOD 15x1232x2464	4.5535	FGP00160	PLYWOOD 15x1232x2464	4.5535	GPAK	100	Active	0	FGOD	m3	1.000000
1334	FGP00157	ALBASIA FALCATA PLYWOOD 15x1232x2464	4.5535	PAK00111	PACKING BERDIRI 49	100	GPAK	100	Active	1	GKPP	Set	0.045500
1335	FGP00159	ALBASIA FALCATA PLYWOOD 32x1220x2440	9.5258	FGP00165	PLYWOOD WBP 32x1220x2440	9.5258	GPAK	100	Active	0	FGOD	m3	1.000000
1336	FGP00159	ALBASIA FALCATA PLYWOOD 32x1220x2440	9.5258	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.095300
1337	FGP00160	PLYWOOD 15x1232x2464	4.5535	WIV00064	VENEER LG 1.3x1220x2440	0.774	PFIN	100	Active	0	WIVE	m3	5.883100
1338	FGP00160	PLYWOOD 15x1232x2464	4.5535	WCP00020	CORE PLYWOOD 13.1x1220x2440	3.8996	PFIN	100	Active	1	WIPA	m3	1.167700
1339	FGP00160	PLYWOOD 15x1232x2464	4.5535	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	SUPP	Kg	0.046000
1340	FGP00161	ALBASIA FALCATA PLYWOOD MRE 9x1200x2400	2.5920	FGP00230	FG PLYWOOD MRE 9x1200x2400	2.592	GPAK	100	Active	0	FGOD	m3	1.000000
1341	FGP00161	ALBASIA FALCATA PLYWOOD MRE 9x1200x2400	2.5920	PAK00077	PACKING TUMPUK 80	100	GPAK	100	Active	1	GKPP	Set	0.025900
1342	FGP00163	ALBASIA FALCATA PLYWOOD 20x1220x2440	5.9536	FGP00162	PLYWOOD 20x1220x2440	5.9536	GPAK	100	Active	0	FGOD	m3	1.000000
1343	FGP00163	ALBASIA FALCATA PLYWOOD 20x1220x2440	5.9536	PAK00088	PACKING TUMPUK 180	100	GPAK	100	Active	1	GKPP	Set	0.059500
1344	FGP00164	ALBASIA FALCATA PLYWOOD MRE 21x1220x2500	6.4050	FGP00545	FG PLYWOOD 21x1220x2500	6.405	GPAK	100	Active	0	FGOD	m3	1.000000
1345	FGP00164	ALBASIA FALCATA PLYWOOD MRE 21x1220x2500	6.4050	PAK00111	PACKING BERDIRI 49	100	GPAK	100	Active	1	GKPP	Set	0.064100
1346	FGP00168	ALBASIA FALCATA PLYWOOD MDF WBP 18x1245x2464	5.5218	FGP00578	FG PLYWOOD MDF WBP 18x1245x2464	5.5218	GPAK	100	Active	0	FGOD	m3	1.000000
1347	FGP00168	ALBASIA FALCATA PLYWOOD MDF WBP 18x1245x2464	5.5218	PAK00112	PACKING TUMPUK 41	100	GPAK	100	Active	1	GKPP	Set	0.055200
1348	FGP00170	ALBASIA FALCATA PLYWOOD 9x1090x1140	1.1183	FGP00178	PLYWOOD 9x1090x1140	1.1183	GPAK	100	Active	0	FGOD	m3	1.000000
1349	FGP00170	ALBASIA FALCATA PLYWOOD 9x1090x1140	1.1183	PAK00147	PACKING PNC 122	100	GPAK	100	Active	1	GKPP	Set	0.011200
1350	FGP00171	ALBASIA FALCATA PLYWOOD 9x1015x1122	1.0249	FGP00179	PLYWOOD 9x1015x1122	1.0249	GPAK	100	Active	0	FGOD	m3	1.000000
1351	FGP00171	ALBASIA FALCATA PLYWOOD 9x1015x1122	1.0249	PAK00147	PACKING PNC 122	100	GPAK	100	Active	1	GKPP	Set	0.010200
1352	FGP00172	ALBASIA FALCATA PLYWOOD MRE 9x1115x1114	1.1179	FGP00180	PLYWOOD 9x1115x1114	1.1179	GPAK	100	Active	0	FGOD	m3	1.000000
1353	FGP00172	ALBASIA FALCATA PLYWOOD MRE 9x1115x1114	1.1179	PAK00147	PACKING PNC 122	100	GPAK	100	Active	1	GKPP	Set	0.011200
1354	FGP00173	ALBASIA FALCATA PLYWOOD MRE 3x1220x2500	0.9150	FGP00342	FG PLYWOOD 3x1220x2500	0.915	GPAK	100	Active	0	FGOD	m3	1.000000
1355	FGP00173	ALBASIA FALCATA PLYWOOD MRE 3x1220x2500	0.9150	PAK00074	PACKING TUMPUK 210	100	GPAK	100	Active	1	GKPP	Set	0.009200
1356	FGP00176	ALBASIA FALCATA PLYWOOD MRE 40x1220x2500	12.2000	FGP00231	FG PLYWOOD 40x1220x2500	12.2	GPAK	100	Active	0	FGOD	m3	1.000000
1357	FGP00176	ALBASIA FALCATA PLYWOOD MRE 40x1220x2500	12.2000	PAK00139	PACKING BERDIRI 23	100	GPAK	100	Active	1	GKPP	Set	0.122000
1358	FGP00177	ALBASIA FALCATA PLYWOOD WBP 15x1245x2464	4.6015	FGP00191	PLYWOOD 15x1245x2464	4.6015	GPAK	100	Active	0	FGOD	m3	1.000000
1359	FGP00177	ALBASIA FALCATA PLYWOOD WBP 15x1245x2464	4.6015	PAK00111	PACKING BERDIRI 49	100	GPAK	100	Active	1	GKPP	Set	0.046000
1360	FGP00184	ALBASIA FALCATA PLYWOOD MRE 12x694x1985	1.6531	FGP00211	FG PLYWOOD MRE 12x694x1985	1.6531	GPAK	100	Active	0	FGOD	m3	1.000000
1361	FGP00184	ALBASIA FALCATA PLYWOOD MRE 12x694x1985	1.6531	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.016500
1362	FGP00185	ALBASIA FALCATA PLYWOOD MRE 12x649x1985	1.5459	FGP00216	FG PLYWOOD MRE 12x649x1985	1.5459	GPAK	100	Active	0	FGOD	m3	1.000000
1363	FGP00185	ALBASIA FALCATA PLYWOOD MRE 12x649x1985	1.5459	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.015500
1364	FGP00186	ALBASIA FALCATA PLYWOOD MRE 12x1220x1985	2.9060	FGP00226	FG PLYWOOD MRE 12x1220x1985	2.906	GPAK	100	Active	0	FGOD	m3	1.000000
1365	FGP00186	ALBASIA FALCATA PLYWOOD MRE 12x1220x1985	2.9060	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.029100
1366	FGP00187	ALBASIA FALCATA PLYWOOD 15x1220x2300	4.2090	FGP00188	PLYWOOD 15x1220x2300	4.209	GPAK	100	Active	0	FGOD	m3	1.000000
1367	FGP00187	ALBASIA FALCATA PLYWOOD 15x1220x2300	4.2090	PAK00109	PACKING TUMPUK 49	100	GPAK	100	Active	1	GKPP	Set	0.042100
1368	FGP00192	PLYWOOD 12x694x1985	1.6531	WCP00030	CORE PLYWOOD 9x694x1990	1.243	PFIN	100	Active	0	WIPA	m3	1.329900
1369	FGP00192	PLYWOOD 12x694x1985	1.6531	WIV00287	VENEER LG 1.7x770x2000	0.5236	PFIN	100	Active	1	WIVE	m3	3.157200
1370	FGP00192	PLYWOOD 12x694x1985	1.6531	SUP00073	PREMIX UL	100	PFIN	100	Active	2	SUPP	Kg	0.016500
1371	FGP00196	ALBASIA FALCATA PLYWOOD MRE 9x1225x2440	2.6901	FGP00205	PLYWOOD 9x1225x2440	2.6901	GPAK	100	Active	0	FGOD	m3	1.000000
1372	FGP00196	ALBASIA FALCATA PLYWOOD MRE 9x1225x2440	2.6901	PAK00102	PACKING BERDIRI 80	100	GPAK	100	Active	1	GKPP	Set	0.026900
1373	FGP00197	ALBASIA FALCATA PLYWOOD MDF MRE 12x1225x2440	3.5868	FGP00923	FG PLYWOOD MDF MRE 12x1225x2440	3.5868	FGOD	100	Active	0	FGOD	m3	1.000000
1374	FGP00197	ALBASIA FALCATA PLYWOOD MDF MRE 12x1225x2440	3.5868	PAK00108	PACKING BERDIRI 61	100	FGOD	100	Active	1	GKPP	Set	0.035900
1375	FGP00198	ALBASIA FALCATA PLYWOOD MRE 15x1225x2440	4.4835	FGP00207	PLYWOOD MDF MRE 15x1225x2440	4.4835	GPAK	100	Active	0	FGOD	m3	1.000000
1376	FGP00198	ALBASIA FALCATA PLYWOOD MRE 15x1225x2440	4.4835	PAK00111	PACKING BERDIRI 49	100	GPAK	100	Active	1	GKPP	Set	0.044800
1377	FGP00201	ALBASIA FALCATA PLYWOOD MRE 22x1220x2500	6.7100	FGP00435	FG PLYWOOD 22x1220x2500	6.71	GPAK	100	Active	0	FGOD	m3	1.000000
1378	FGP00201	ALBASIA FALCATA PLYWOOD MRE 22x1220x2500	6.7100	PAK00111	PACKING BERDIRI 49	100	GPAK	100	Active	1	GKPP	Set	0.067100
1379	FGP00204	PLYWOOD 23.8x1245x2464	7.3011	RMM00012	MDF 2.5x1265x2485	1.5718	PFIN	100	Active	0	WADA	m3	4.645100
1380	FGP00204	PLYWOOD 23.8x1245x2464	7.3011	WCP00023	CORE PLYWOOD 19x1220x2440	5.6559	PFIN	100	Active	1	WIPA	m3	1.290900
1381	FGP00204	PLYWOOD 23.8x1245x2464	7.3011	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.073700
1382	FGP00206	PLYWOOD MDF MRE 12x1225x2440	3.5868	RMM00009	MDF 1x1220x2440	0.5954	PFIN	100	Active	0	GKOP	m3	6.024200
1383	FGP00206	PLYWOOD MDF MRE 12x1225x2440	3.5868	WIV00015	VENEER SG 2x1220x2440	1.7862	PFIN	100	Active	1	GKOP	m3	2.008100
1384	FGP00206	PLYWOOD MDF MRE 12x1225x2440	3.5868	WIV00590	VENEER LG 2.6x1220x2500	1.586	PFIN	100	Active	2	GKOP	m3	2.261500
1385	FGP00206	PLYWOOD MDF MRE 12x1225x2440	3.5868	SUP00099	PREMIX MRE-0 1020	307.5	PFIN	100	Active	3	GKOP	Kg	0.011700
1386	FGP00210	FG PLYWOOD MRE 12x694x2190	1.8238	WIV00293	VENEER LG 2x770x2200	0.6776	FGOD	100	Active	0	GKOP	m3	2.691600
1387	FGP00210	FG PLYWOOD MRE 12x694x2190	1.8238	WIV00226	VENEER LG 2x770x2300	0.7084	FGOD	100	Active	1	GKOP	m3	2.574500
1388	FGP00210	FG PLYWOOD MRE 12x694x2190	1.8238	WIV00209	VENEER SG 2x770x2300	1.0626	FGOD	100	Active	2	GKOP	m3	1.716400
1389	FGP00210	FG PLYWOOD MRE 12x694x2190	1.8238	SUP00099	PREMIX MRE-0 1020	195.8183	FGOD	100	Active	3	GKOP	Kg	0.009300
1390	FGP00211	FG PLYWOOD MRE 12x694x1985	1.6531	WIV00254	VENEER LG 2x770x2000	1.232	FGOD	100	Active	0	GKOP	m3	1.341800
1391	FGP00211	FG PLYWOOD MRE 12x694x1985	1.6531	WIV00213	VENEER SG 2x770x2000	0.924	FGOD	100	Active	1	GKOP	m3	1.789100
1392	FGP00211	FG PLYWOOD MRE 12x694x1985	1.6531	SUP00099	PREMIX MRE-0 1020	195.8183	FGOD	100	Active	2	GKOP	Kg	0.008400
1393	FGP00212	FG PLYWOOD MRE 12x1220x2440	3.5722	FGP00027	PLYWOOD MRE 12x1220x2440	3.5722	FGOD	100	Active	0	PFIN	m3	1.000000
1394	FGP00213	FG PLYWOOD MRE 10x1220x2500	3.0500	FGP00024	PLYWOOD MRE 10x1220x2500	3.05	FGOD	100	Active	0	PFIN	m3	1.000000
1395	FGP00214	FG PLYWOOD MRE 12x1220x2500	3.6600	FGP00028	PLYWOOD MRE 12x1220x2500	3.66	FGOD	100	Active	0	PFIN	m3	1.000000
1396	FGP00216	FG PLYWOOD MRE 12x649x1985	1.5459	WIV00287	VENEER LG 1.7x770x2000	0.5236	FGOD	100	Active	0	GKOP	m3	2.952400
1397	FGP00216	FG PLYWOOD MRE 12x649x1985	1.5459	WIV00254	VENEER LG 2x770x2000	0.616	FGOD	100	Active	1	GKOP	m3	2.509600
1398	FGP00216	FG PLYWOOD MRE 12x649x1985	1.5459	WIV00213	VENEER SG 2x770x2000	0.924	FGOD	100	Active	2	GKOP	m3	1.673100
1399	FGP00216	FG PLYWOOD MRE 12x649x1985	1.5459	SUP00099	PREMIX MRE-0 1020	195.8183	FGOD	100	Active	3	GKOP	Kg	0.007900
1400	FGP00217	FG PLYWOOD MRE 15x1220x2500	4.5750	FGP00033	PLYWOOD MRE 15x1220x2500	4.575	FGOD	100	Active	0	PFIN	m3	1.000000
1401	FGP00218	FG PLYWOOD MRE 18x1220x2440	5.3582	FGP00034	PLYWOOD MRE 18x1220x2440	5.3582	FGOD	100	Active	0	PFIN	m3	1.000000
1402	FGP00219	FG PLYWOOD MRE 18x1220x2500	5.4900	FGP00035	PLYWOOD MRE 18x1220x2500	5.49	FGOD	100	Active	0	PFIN	m3	1.000000
1403	FGP00220	FG PLYWOOD MRE 25x1220x2500	7.6250	WIV00064	VENEER LG 1.3x1220x2440	0.774	FGOD	100	Active	0	GKOP	m3	9.851400
1404	FGP00220	FG PLYWOOD MRE 25x1220x2500	7.6250	WIV00032	VENEER SG 2.6x1220x2440	3.096	FGOD	100	Active	1	GKOP	m3	2.462900
1405	FGP00220	FG PLYWOOD MRE 25x1220x2500	7.6250	WIV00015	VENEER SG 2x1220x2440	1.1908	FGOD	100	Active	2	GKOP	m3	6.403300
1406	FGP00220	FG PLYWOOD MRE 25x1220x2500	7.6250	WIV00070	VENEER LG 2x1220x2440	2.977	FGOD	100	Active	3	GKOP	m3	2.561300
1407	FGP00220	FG PLYWOOD MRE 25x1220x2500	7.6250	SUP00099	PREMIX MRE-0 1020	702.9027	FGOD	100	Active	4	GKOP	Kg	0.010800
1408	FGP00222	FG PLYWOOD MRE 4x1220x2500	1.2200	FGP00806	PLATFORM PLYWOOD MRE-0 4x1220x2500	1.22	FGOD	100	Active	0	PFIN	m3	1.000000
1409	FGP00223	FG PLYWOOD MRE 5x1220x2500	1.5250	FGP00007	PLYWOOD MRE 5x1220x2500	1.525	FGOD	100	Active	0	PFIN	m3	1.000000
1410	FGP00224	FG PLYWOOD WBP 8x1220x2500	2.4400	FGP01007	PLYWOOD WBP 8x1220x2500	2.44	FGOD	100	Active	0	PFIN	m3	1.000000
1411	FGP00225	FG PLYWOOD MRE 6x1220x2440	1.7861	FGP00011	PLYWOOD MRE 6x1220x2440	1.7861	FGOD	100	Active	0	PFIN	m3	1.000000
1412	FGP00226	FG PLYWOOD MRE 12x1220x1985	2.9060	WIV00283	VENEER LG 1.7x1220x2000	0.8296	FGOD	100	Active	0	GKOP	m3	3.502900
1413	FGP00226	FG PLYWOOD MRE 12x1220x1985	2.9060	WIV00285	VENEER LG 2x1220x2000	0.976	FGOD	100	Active	1	GKOP	m3	2.977500
1414	FGP00226	FG PLYWOOD MRE 12x1220x1985	2.9060	WIV00295	VENEER SG 2x1220x2000	1.464	FGOD	100	Active	2	GKOP	m3	1.985000
1415	FGP00226	FG PLYWOOD MRE 12x1220x1985	2.9060	SUP00099	PREMIX MRE-0 1020	313.3093	FGOD	100	Active	3	GKOP	Kg	0.009300
1416	FGP00227	FG PLYWOOD MRE 9x1065x1140	1.0927	WIV00011	VENEER SG 2x1220x1220	1.4885	FGOD	100	Active	0	GKOP	m3	0.734100
1417	FGP00227	FG PLYWOOD MRE 9x1065x1140	1.0927	SUP00073	PREMIX UL MRE-1	116.2423	FGOD	100	Active	1	GKOP	Kg	0.009400
1418	FGP00228	FG PLYWOOD MRE 9x1140x1140	1.1696	WIV00524	VENEER LG 2x1220x2500	0.915	FGOD	100	Active	0	GKOP	m3	1.278300
1419	FGP00228	FG PLYWOOD MRE 9x1140x1140	1.1696	WIV00015	VENEER SG 2x1220x2440	0.5954	FGOD	100	Active	1	GKOP	m3	1.964400
1420	FGP00228	FG PLYWOOD MRE 9x1140x1140	1.1696	SUP00073	PREMIX UL MRE-1	116.2423	FGOD	100	Active	2	GKOP	Kg	0.010100
1421	FGP00229	FG PLYWOOD MRE 9x990x1122	0.9997	WIV00011	VENEER SG 2x1220x1220	1.4885	FGOD	100	Active	0	GKOP	m3	0.671600
1422	FGP00229	FG PLYWOOD MRE 9x990x1122	0.9997	SUP00073	PREMIX UL MRE-1	116.2423	FGOD	100	Active	1	GKOP	Kg	0.008600
1423	FGP00231	FG PLYWOOD MRE 40x1220x2500	12.2000	WIV00527	VENEER LG 1x1220x2500	0.61	FGOD	100	Active	0	GKOP	m3	20.000000
1424	FGP00231	FG PLYWOOD MRE 40x1220x2500	12.2000	WIV00025	VENEER SG 2.6x1220x1220	0.774	FGOD	100	Active	1	GKOP	m3	15.762300
1425	FGP00231	FG PLYWOOD MRE 40x1220x2500	12.2000	WIV00032	VENEER SG 2.6x1220x2440	0.774	FGOD	100	Active	2	GKOP	m3	15.762300
1426	FGP00231	FG PLYWOOD MRE 40x1220x2500	12.2000	WIV00590	VENEER LG 2.6x1220x2500	6.344	FGOD	100	Active	3	GKOP	m3	1.923100
1427	FGP00231	FG PLYWOOD MRE 40x1220x2500	12.2000	WIV00011	VENEER SG 2x1220x1220	1.7862	FGOD	100	Active	4	GKOP	m3	6.830100
1428	FGP00231	FG PLYWOOD MRE 40x1220x2500	12.2000	WIV00015	VENEER SG 2x1220x2440	2.3816	FGOD	100	Active	5	GKOP	m3	5.122600
1429	FGP00231	FG PLYWOOD MRE 40x1220x2500	12.2000	SUP00099	PREMIX MRE-0 1020	1080	FGOD	100	Active	6	GKOP	Kg	0.011300
1430	FGP00245	FG PLYWOOD MRE 12x739x2190	1.9421	WIV00223	VENEER LG 1.7x770x2200	0.576	FGOD	100	Active	0	GKOP	m3	3.371700
1431	FGP00245	FG PLYWOOD MRE 12x739x2190	1.9421	WIV00293	VENEER LG 2x770x2200	0.6776	FGOD	100	Active	1	GKOP	m3	2.866100
1432	FGP00245	FG PLYWOOD MRE 12x739x2190	1.9421	WIV00279	VENEER SG 2x770x2200	1.0164	FGOD	100	Active	2	GKOP	m3	1.910800
1433	FGP00245	FG PLYWOOD MRE 12x739x2190	1.9421	SUP00099	PREMIX MRE-0 1020	195.8183	FGOD	100	Active	3	GKOP	Kg	0.009900
1434	FGP00246	FG PLYWOOD WBP 17.5x1245x2464	5.3684	RMM00012	MDF 2.5x1265x2485	1.5718	FGOD	100	Active	0	GKOP	m3	3.415400
1435	FGP00246	FG PLYWOOD WBP 17.5x1245x2464	5.3684	WIV00070	VENEER LG 2x1220x2440	1.7862	FGOD	100	Active	1	GKOP	m3	3.005500
1436	FGP00246	FG PLYWOOD WBP 17.5x1245x2464	5.3684	WIV00015	VENEER SG 2x1220x2440	1.7862	FGOD	100	Active	2	GKOP	m3	3.005500
1437	FGP00246	FG PLYWOOD WBP 17.5x1245x2464	5.3684	WIV00032	VENEER SG 2.6x1220x2440	0.774	FGOD	100	Active	3	GKOP	m3	6.935900
1438	FGP00246	FG PLYWOOD WBP 17.5x1245x2464	5.3684	SUP00075	PREMIX BONDTITE	468.6018	FGOD	100	Active	4	GKOP	Kg	0.011500
1439	FGP00255	FG PLYWOOD MRE 25x1220x2440	7.4420	WIV00049	VENEER LG 1x1220x2440	0.5954	FGOD	100	Active	0	GKOP	m3	12.499200
1440	FGP00255	FG PLYWOOD MRE 25x1220x2440	7.4420	WIV00032	VENEER SG 2.6x1220x2440	3.096	FGOD	100	Active	1	GKOP	m3	2.403700
1441	FGP00255	FG PLYWOOD MRE 25x1220x2440	7.4420	WIV00015	VENEER SG 2x1220x2440	1.1908	FGOD	100	Active	2	GKOP	m3	6.249600
1442	FGP00255	FG PLYWOOD MRE 25x1220x2440	7.4420	WIV00070	VENEER LG 2x1220x2440	2.977	FGOD	100	Active	3	GKOP	m3	2.499800
1443	FGP00255	FG PLYWOOD MRE 25x1220x2440	7.4420	SUP00099	PREMIX MRE-0 1020	702.9027	FGOD	100	Active	4	GKOP	Kg	0.010600
1444	FGP00257	FG PLYWOOD MRE 6x1220x2500	1.8300	FGP00012	PLYWOOD MRE 6x1220x2500	1.83	FGOD	100	Active	0	PFIN	m3	1.000000
1445	FGP00258	FG PLYWOOD WBP 3x1232x2451	0.9059	WIV00301	VENEER SG 1x1220x2440	0.2977	FGOD	100	Active	0	GKOP	m3	3.043000
1446	FGP00258	FG PLYWOOD WBP 3x1232x2451	0.9059	WIV00064	VENEER LG 1.3x1220x2440	0.774	FGOD	100	Active	1	GKOP	m3	1.170400
1447	FGP00258	FG PLYWOOD WBP 3x1232x2451	0.9059	SUP00073	PREMIX UL MRE-1	117.1504	FGOD	100	Active	2	GKOP	Kg	0.007700
1448	FGP00259	FG PLYWOOD WBP 18x1232x2451	5.4353	WIV00032	VENEER SG 2.6x1220x2440	1.548	FGOD	100	Active	0	GKOP	m3	3.511200
1449	FGP00259	FG PLYWOOD WBP 18x1232x2451	5.4353	WIV00524	VENEER LG 2x1220x2500	1.83	FGOD	100	Active	1	GKOP	m3	2.970100
1450	FGP00259	FG PLYWOOD WBP 18x1232x2451	5.4353	WIV00025	VENEER SG 2.6x1220x1220	1.548	FGOD	100	Active	2	GKOP	m3	3.511200
1451	FGP00259	FG PLYWOOD WBP 18x1232x2451	5.4353	WIV00011	VENEER SG 2x1220x1220	1.1908	FGOD	100	Active	3	GKOP	m3	4.564400
1452	FGP00259	FG PLYWOOD WBP 18x1232x2451	5.4353	SUP00075	PREMIX BONDTITE	351.4513	FGOD	100	Active	4	GKOP	Kg	0.015500
1453	FGP00260	R PLYWOOD 12x694x2190	3.5722	FGP00120	PLYWOOD 12x694x2190	1	GRPF	100	Active	0	PFIN	m3	3.572200
1454	FGP00261	ALBASIA FALCATA PLYWOOD WBP 17.5x1245x2464	5.3684	FGP00246	FG PLYWOOD WBP 17.5x1245x2464	5.3684	GPAK	100	Active	0	FGOD	m3	1.000000
1455	FGP00261	ALBASIA FALCATA PLYWOOD WBP 17.5x1245x2464	5.3684	PAK00135	PACKING BERDIRI 57	100	GPAK	100	Active	1	GKPP	Set	0.053700
1456	FGP00263	ALBASIA FALCATA PLYWOOD PVAC 15x36x850	0.0459	FGP00273	PLYWOOD 15x36x850	0.0459	GPAK	100	Active	0	FGOD	m3	1.000000
1457	FGP00263	ALBASIA FALCATA PLYWOOD PVAC 15x36x850	0.0459	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.000500
1458	FGP00264	ALBASIA FALCATA PLYWOOD PVAC 21x36x850	0.0643	FGP00274	PLYWOOD MRE 21x36x850	0.0643	GPAK	100	Active	0	FGOD	m3	1.000000
1459	FGP00264	ALBASIA FALCATA PLYWOOD PVAC 21x36x850	0.0643	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.000600
1460	FGP00265	FG PLYWOOD MRE 10x1220x2440	2.9768	WIV00070	VENEER LG 2x1220x2440	1.1908	FGOD	100	Active	0	GKOP	m3	2.499800
1461	FGP00265	FG PLYWOOD MRE 10x1220x2440	2.9768	WIV00081	VENEER LG 3.2x1220x1900	0.7418	FGOD	100	Active	1	GKOP	m3	4.012900
1462	FGP00265	FG PLYWOOD MRE 10x1220x2440	2.9768	WIV00322	VENEER SG 2.8x1220x2000	1.3664	FGOD	100	Active	2	GKOP	m3	2.178600
1463	FGP00265	FG PLYWOOD MRE 10x1220x2440	2.9768	SUP00079	PREMIX UL MRE-0	234.3009	FGOD	100	Active	3	GKOP	Kg	0.012700
1464	FGP00275	R PLYWOOD 15x1220x2440	1.0927	FGP00032	PLYWOOD 15x1220x2440	1	GRPF	100	Active	0	PFIN	m3	1.092700
1465	FGP00285	ALBASIA FALCATA PLYWOOD PVAC 21x32x850	0.0571	FGP00296	PLYWOOD 21x32x850	0.0571	GPAK	100	Active	0	FGOD	m3	1.000000
1466	FGP00285	ALBASIA FALCATA PLYWOOD PVAC 21x32x850	0.0571	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.000600
1467	FGP00286	ALBASIA FALCATA PLYWOOD PVAC 21x36x650	0.0491	FGP00297	PLYWOOD 21x36x650	0.0491	GPAK	100	Active	0	FGOD	m3	1.000000
1468	FGP00286	ALBASIA FALCATA PLYWOOD PVAC 21x36x650	0.0491	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.000500
1469	FGP00287	ALBASIA FALCATA PLYWOOD PVAC 21x32x650	0.0437	FGP00298	PLYWOOD 21x32x650	0.0437	GPAK	100	Active	0	FGOD	m3	1.000000
1470	FGP00287	ALBASIA FALCATA PLYWOOD PVAC 21x32x650	0.0437	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.000400
1471	FGP00288	ALBASIA FALCATA PLYWOOD MRE 21x36x580	0.0438	FGP00299	PLYWOOD 21x36x580	0.0438	GPAK	100	Active	0	FGOD	m3	1.000000
1472	FGP00288	ALBASIA FALCATA PLYWOOD MRE 21x36x580	0.0438	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.000400
1473	FGP00289	ALBASIA FALCATA PLYWOOD PVAC 15x32x850	0.0408	FGP00300	PLYWOOD 15x32x850	0.0408	GPAK	100	Active	0	FGOD	m3	1.000000
1474	FGP00289	ALBASIA FALCATA PLYWOOD PVAC 15x32x850	0.0408	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.000400
1475	FGP00290	ALBASIA FALCATA PLYWOOD PVAC 15x34x580	0.0296	FGP00301	PLYWOOD 15x34x580	0.0296	GPAK	100	Active	0	FGOD	m3	1.000000
1476	FGP00290	ALBASIA FALCATA PLYWOOD PVAC 15x34x580	0.0296	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.000300
1477	FGP00302	R PLYWOOD 4x1220x2500	1.8238	FGP00004	PLYWOOD 4x1220x2500	1	GRPF	100	Active	0	PFIN	m3	1.823800
1478	FGP00327	FG PLYWOOD MRE 5.5x1220x2440	1.6372	FGP00009	PLYWOOD MRE 5.5x1220x2440	1.6372	FGOD	100	Active	0	PFIN	m3	1.000000
1479	FGP00330	FG PLYWOOD MRE 9x1220x2440	2.6791	FGP00021	PLYWOOD MRE 9x1220x2440	2.6791	FGOD	100	Active	0	PFIN	m3	1.000000
1480	FGP00332	ALBASIA FALCATA PLYWOOD MRE 11.1x1245x2464	3.4051	FGP00373	FG PLYWOOD 11.1x1245x2464	3.4051	GPAK	100	Active	0	FGOD	m3	1.000000
1481	FGP00332	ALBASIA FALCATA PLYWOOD MRE 11.1x1245x2464	3.4051	PAK00133	PACKING BERDIRI 85	100	GPAK	100	Active	1	GKPP	Set	0.034100
1482	FGP00333	ALBASIA FALCATA PLYWOOD WBP 23.8x1245x2464	7.3011	FGP00377	FG PLYWOOD 23.8x1245x2464	7.3011	GPAK	100	Active	0	FGOD	m3	1.000000
1483	FGP00333	ALBASIA FALCATA PLYWOOD WBP 23.8x1245x2464	7.3011	PAK00136	PACKING BERDIRI 40	100	GPAK	100	Active	1	GKPP	Set	0.073000
1484	FGP00353	FG PLYWOOD MRE 2.7x1220x2440	0.8037	FGP00085	PLYWOOD MRE 2.7x1220x2440	0.8037	PFIN	100	Active	0	PFIN	m3	1.000000
1485	FGP00359	FG PLYWOOD MRE 9x1220x2500	2.7450	WIV00527	VENEER LG 1x1220x2500	0.61	FGOD	100	Active	0	GKOP	m3	4.500000
1486	FGP00359	FG PLYWOOD MRE 9x1220x2500	2.7450	WIV00015	VENEER SG 2x1220x2440	2.977	FGOD	100	Active	1	GKOP	m3	0.922100
1487	FGP00359	FG PLYWOOD MRE 9x1220x2500	2.7450	SUP00099	PREMIX MRE-0 1020	360	FGOD	100	Active	2	GKOP	Kg	0.007600
1488	FGP00402	FG PLYWOOD MRE 21x1220x2440	6.2513	FGP00089	PLYWOOD MRE 21x1220x2440	6.2513	FGOD	100	Active	0	PFIN	m3	1.000000
1489	FGP00440	FG PLYWOOD WBP 3x1220x2440	0.8930	WIV00530	VENEER LG 1.3x1220x2500	0.793	FGOD	100	Active	0	GKOP	m3	1.126100
1490	FGP00440	FG PLYWOOD WBP 3x1220x2440	0.8930	WIV00015	VENEER SG 2x1220x2440	0.5954	FGOD	100	Active	1	GKOP	m3	1.499800
1491	FGP00440	FG PLYWOOD WBP 3x1220x2440	0.8930	SUP00075	PREMIX BONDTITE	117.1504	FGOD	100	Active	2	GKOP	Kg	0.007600
1492	FGP00446	ALBASIA FALCATA PLYWOOD MRE 2.7x1220x2500	0.8235	FGP00493	FG PLYWOOD MRE 2.7x1220x2500	0.8235	GPAK	100	Active	0	FGOD	m3	1.000000
1493	FGP00446	ALBASIA FALCATA PLYWOOD MRE 2.7x1220x2500	0.8235	PAK00074	PACKING TUMPUK 210	100	GPAK	100	Active	1	GKPP	Set	0.008200
1494	FGP00469	ALBASIA FALCATA PLYWOOD MRE 12x1200x2400	3.4560	FGP00488	FG PLYWOOD MRE 12x1200x2400	3.456	GPAK	100	Active	0	FGOD	m3	1.000000
1495	FGP00469	ALBASIA FALCATA PLYWOOD MRE 12x1200x2400	3.4560	PAK00108	PACKING BERDIRI 61	100	GPAK	100	Active	1	GKPP	Set	0.034600
1496	FGP00474	ALBASIA FALCATA PLYWOOD WBP 17.5x1245x3073	6.6953	FGP00504	FG PLYWOOD WBP 17.5x1245x3073	6.6953	GPAK	100	Active	0	FGOD	m3	1.000000
1497	FGP00474	ALBASIA FALCATA PLYWOOD WBP 17.5x1245x3073	6.6953	PAK00135	PACKING BERDIRI 57	100	GPAK	100	Active	1	GKPP	Set	0.067000
1498	FGP00493	FG PLYWOOD MRE 2.7x1220x2500	0.8235	FGP00940	PLATFORM PLYWOOD 2.7x1220x2500	0.8235	FGOD	100	Active	0	WADA	m3	1.000000
1499	FGP00504	FG PLYWOOD WBP 17.5x1245x3073	6.6953	WIV00404	VENEER SG 2x1220x3100	1.5128	FGOD	100	Active	0	GKOP	m3	4.425800
1500	FGP00504	FG PLYWOOD WBP 17.5x1245x3073	6.6953	WIV00402	VENEER LG 2x1220x3100	3.0256	FGOD	100	Active	1	GKOP	m3	2.212900
1501	FGP00504	FG PLYWOOD WBP 17.5x1245x3073	6.6953	WIV00446	VENEER SG 2.6x650x1220	2.4744	FGOD	100	Active	2	GKOP	m3	2.705800
1502	FGP00504	FG PLYWOOD WBP 17.5x1245x3073	6.6953	SUP00093	LEM HENKEL AQUENCE SL 8460 BC, 4.0	351.4513	FGOD	100	Active	3	GKOP	kg	0.019100
1503	FGP00524	ALBASIA FALCATA PLYWOOD MRE 13x1220x2200	3.4892	FGP00531	FG PLYWOOD 13x1220x2200	3.4892	GPAK	100	Active	0	FGOD	m3	1.000000
1504	FGP00524	ALBASIA FALCATA PLYWOOD MRE 13x1220x2200	3.4892	PAK00109	PACKING TUMPUK 49	100	GPAK	100	Active	1	GKPP	Set	0.034900
1505	FGP00550	ALBASIA FALCATA PLYWOOD MRE 9x1220x2280	2.5034	FGP00564	FG PLYWOOD MRE 9x1220x2280	2.5034	GPAK	100	Active	0	FGOD	m3	1.000000
1506	FGP00550	ALBASIA FALCATA PLYWOOD MRE 9x1220x2280	2.5034	PAK00094	PACKING TUMPUK 120	100	GPAK	100	Active	1	GKPP	Set	0.025000
1507	FGP00557	PLYWOOD MRE 9x1220x2280	2.5034	WIV00048	VENEER LG 1x1220x2300	0.5612	PFIN	100	Active	0	GKOP	m3	4.460800
1508	FGP00557	PLYWOOD MRE 9x1220x2280	2.5034	WCP00132	CORE PLYWOOD MRE 7x1220x2280	1.9471	PFIN	100	Active	1	WIPA	m3	1.285700
1509	FGP00557	PLYWOOD MRE 9x1220x2280	2.5034	SUP00099	PREMIX MRE-0 1020	102.5	PFIN	100	Active	2	GKOP	Kg	0.024400
1510	FGP00564	FG PLYWOOD MRE 9x1220x2280	2.5034	FGP00557	PLYWOOD MRE 9x1220x2280	2.5034	FGOD	100	Active	0	PFIN	m3	1.000000
1511	FGP00578	FG PLYWOOD MDF WBP 18x1245x2464	5.5218	RMM00012	MDF 2.5x1265x2485	1.5718	FGOD	100	Active	0	GKOP	m3	3.513000
1512	FGP00578	FG PLYWOOD MDF WBP 18x1245x2464	5.5218	WIV00070	VENEER LG 2x1220x2440	1.7862	FGOD	100	Active	1	GKOP	m3	3.091400
1513	FGP00578	FG PLYWOOD MDF WBP 18x1245x2464	5.5218	WIV00015	VENEER SG 2x1220x2440	1.1908	FGOD	100	Active	2	GKOP	m3	4.637100
1514	FGP00578	FG PLYWOOD MDF WBP 18x1245x2464	5.5218	WIV00032	VENEER SG 2.6x1220x2440	1.548	FGOD	100	Active	3	GKOP	m3	3.567100
1515	FGP00578	FG PLYWOOD MDF WBP 18x1245x2464	5.5218	SUP00075	PREMIX BONDTITE	468.6018	FGOD	100	Active	4	GKOP	Kg	0.011800
1516	FGP00583	FG PLYWOOD WBP MDF 19x1245x2464	5.8286	RMM00021	MDF 1.5X1265X2485	0.943	FGOD	100	Active	0	GKOP	m3	6.180900
1517	FGP00583	FG PLYWOOD WBP MDF 19x1245x2464	5.8286	WIV00015	VENEER SG 2x1220x2440	2.977	FGOD	100	Active	1	GKOP	m3	1.957900
1518	FGP00583	FG PLYWOOD WBP MDF 19x1245x2464	5.8286	WIV00070	VENEER LG 2x1220x2440	2.3816	FGOD	100	Active	2	GKOP	m3	2.447300
1519	FGP00583	FG PLYWOOD WBP MDF 19x1245x2464	5.8286	SUP00099	PREMIX MRE-0 1020	585.7522	FGOD	100	Active	3	GKOP	Kg	0.010000
1520	FGP00590	ALBASIA FALCATA PLYWOOD MRE 28x1220x2500	8.5400	FGP00592	FG PLYWOOD 28x1220x2500	8.54	GPAK	100	Active	0	FGOD	m3	1.000000
1521	FGP00590	ALBASIA FALCATA PLYWOOD MRE 28x1220x2500	8.5400	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.085400
1522	FGP00603	ALBASIA FALCATA PLYWOOD MRE 4x1245x2500	1.2450	FGP00627	FG PLYWOOD MRE 4x1245x2500	1.245	GPAK	100	Active	0	FGOD	m3	1.000000
1523	FGP00603	ALBASIA FALCATA PLYWOOD MRE 4x1245x2500	1.2450	PAK00088	PACKING TUMPUK 180	100	GPAK	100	Active	1	GKPP	Set	0.012500
1524	FGP00604	ALBASIA FALCATA PLYWOOD MRE 6x1245x2500	1.8675	FGP00628	FG PLYWOOD MRE 6x1245x2500	1.8675	GPAK	100	Active	0	FGOD	m3	1.000000
1525	FGP00604	ALBASIA FALCATA PLYWOOD MRE 6x1245x2500	1.8675	PAK00094	PACKING TUMPUK 120	100	GPAK	100	Active	1	GKPP	Set	0.018700
1526	FGP00606	ALBASIA FALCATA PLYWOOD MRE 12x1245x2500	3.7350	FGP00630	FG PLYWOOD 12x1245x2500	3.735	GPAK	100	Active	0	FGOD	m3	1.000000
1527	FGP00606	ALBASIA FALCATA PLYWOOD MRE 12x1245x2500	3.7350	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.037400
1528	FGP00607	ALBASIA FALCATA PLYWOOD MRE 15x1245x2500	4.6688	FGP00631	FG PLYWOOD MRE 15x1245x2500	4.6688	GPAK	100	Active	0	FGOD	m3	1.000000
1529	FGP00607	ALBASIA FALCATA PLYWOOD MRE 15x1245x2500	4.6688	PAK00109	PACKING TUMPUK 49	100	GPAK	100	Active	1	GKPP	Set	0.046700
1530	FGP00608	ALBASIA FALCATA PLYWOOD MRE 18x1245x2500	5.6025	FGP00632	FG PLYWOOD 18x1245x2500	5.6025	GPAK	100	Active	0	FGOD	m3	1.000000
1531	FGP00608	ALBASIA FALCATA PLYWOOD MRE 18x1245x2500	5.6025	PAK00114	PACKING BERDIRI 41	100	GPAK	100	Active	1	GKPP	Set	0.056000
1532	FGP00609	ALBASIA FALCATA PLYWOOD MRE 22x1245x2500	6.8475	FGP00633	FG PLYWOOD 22x1245x2500	6.8475	GPAK	100	Active	0	FGOD	m3	1.000000
1533	FGP00609	ALBASIA FALCATA PLYWOOD MRE 22x1245x2500	6.8475	PAK00137	PACKING BERDIRI 34	100	GPAK	100	Active	1	GKPP	Set	0.068500
1534	FGP00610	ALBASIA FALCATA PLYWOOD MRE 25x1245x2500	7.7813	FGP00634	FG PLYWOOD 25x1245x2500	7.7813	GPAK	100	Active	0	FGOD	m3	1.000000
1535	FGP00610	ALBASIA FALCATA PLYWOOD MRE 25x1245x2500	7.7813	PAK00123	PACKING BERDIRI 30	100	GPAK	100	Active	1	GKPP	Set	0.077800
1536	FGP00615	PLYWOOD MRE 15x1245x2500	4.6688	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	7.653800
1537	FGP00615	PLYWOOD MRE 15x1245x2500	4.6688	WCP00133	CORE PLYWOOD MRE 13.6x1245x2500	4.233	PFIN	100	Active	1	WIPA	m3	1.103000
1538	FGP00615	PLYWOOD MRE 15x1245x2500	4.6688	SUP00099	PREMIX MRE-0 1020	110	PFIN	100	Active	2	GKOP	Kg	0.042400
1539	FGP00631	FG PLYWOOD MRE 15x1245x2500	4.6688	FGP00615	PLYWOOD MRE 15x1245x2500	4.6688	FGOD	100	Active	0	PFIN	m3	1.000000
1540	FGP00664	FG PLYWOOD MDF WBP 18x1232x2452	5.4376	RMM00033	MDF 2x1265x2485	1.2574	FGOD	100	Active	0	GKOP	m3	4.324500
1541	FGP00664	FG PLYWOOD MDF WBP 18x1232x2452	5.4376	WIV00032	VENEER SG 2.6x1220x2440	1.548	FGOD	100	Active	1	GKOP	m3	3.512700
1542	FGP00664	FG PLYWOOD MDF WBP 18x1232x2452	5.4376	WIV00590	VENEER LG 2.6x1220x2500	2.379	FGOD	100	Active	2	GKOP	m3	2.285700
1543	FGP00664	FG PLYWOOD MDF WBP 18x1232x2452	5.4376	WIV00015	VENEER SG 2x1220x2440	1.1908	FGOD	100	Active	3	GKOP	m3	4.566300
1544	FGP00664	FG PLYWOOD MDF WBP 18x1232x2452	5.4376	SUP00099	PREMIX MRE-0 1020	480	FGOD	100	Active	4	GKOP	Kg	0.011300
1545	FGP00673	ALBASIA FALCATA PLYWOOD WBP 7x1220x2500	2.1350	FGP00678	FG PLYWOOD 7x1220x2500	2.135	GPAK	100	Active	0	FGOD	m3	1.000000
1546	FGP00673	ALBASIA FALCATA PLYWOOD WBP 7x1220x2500	2.1350	PAK00076	PACKING TUMPUK 100	100	GPAK	100	Active	1	GKPP	Set	0.021400
1547	FGP00681	ALBASIA FALCATA PLYWOOD WBP 38.1x805x1943	5.9593	FGP00699	FG PLYWOOD WBP 38.1x805x1943	5.9593	GPAK	100	Active	0	FGOD	m3	1.000000
1548	FGP00681	ALBASIA FALCATA PLYWOOD WBP 38.1x805x1943	5.9593	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.059600
1549	FGP00682	FG PLYWOOD WBP 12x1220x2440	3.5722	FGP00685	PLYWOOD WBP 12x1220x2440	3.5722	FGOD	100	Active	0	PFIN	m3	1.000000
1550	FGP00685	PLYWOOD WBP 12x1220x2440	3.5722	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	5.856100
1551	FGP00685	PLYWOOD WBP 12x1220x2440	3.5722	WCP00100	CORE PLYWOOD WBP 10.3x1220x2440	3.0661	PFIN	100	Active	1	WIPA	m3	1.165100
1552	FGP00685	PLYWOOD WBP 12x1220x2440	3.5722	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.036100
1553	FGP00685	PLYWOOD WBP 12x1220x2440	3.5722	SUP00005	LEM PROTECTA C-3, BC 23	0.149	PFIN	100	Active	3	GKOP	kg	23.974500
1554	FGP00688	PLYWOOD MDF MRE 15x1220x2440	4.4652	RMM00033	MDF 2x1265x2485	1.2574	PFIN	100	Active	0	WADA	m3	3.551100
1555	FGP00688	PLYWOOD MDF MRE 15x1220x2440	4.4652	WCP00005	CORE PLYWOOD MDF MRE 12x1220x2440	3.5722	PFIN	100	Active	1	WIPA	m3	1.250000
1556	FGP00688	PLYWOOD MDF MRE 15x1220x2440	4.4652	SUP00099	PREMIX MRE-0 1020	102.5	PFIN	100	Active	2	GKOP	Kg	0.043600
1557	FGP00690	PLYWOOD WBP 15x1220x2500	4.5750	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	7.500000
1558	FGP00690	PLYWOOD WBP 15x1220x2500	4.5750	WCP00149	CORE PLYWOOD WBP 13x1220x2500	3.965	PFIN	100	Active	1	WIPA	m3	1.153800
1559	FGP00690	PLYWOOD WBP 15x1220x2500	4.5750	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.046200
1560	FGP00691	PLYWOOD WBP 18x1220x2440	5.3582	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	8.783900
1561	FGP00691	PLYWOOD WBP 18x1220x2440	5.3582	WCP00102	CORE PLYWOOD WBP 16.3x1220x2440	4.8522	PFIN	100	Active	1	WIPA	m3	1.104300
1562	FGP00691	PLYWOOD WBP 18x1220x2440	5.3582	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.054100
1563	FGP00695	PLYWOOD WBP 4x1220x2500	1.2200	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	2.000000
1564	FGP00695	PLYWOOD WBP 4x1220x2500	1.2200	WIV00015	VENEER SG 2x1220x2440	0.5954	PFIN	100	Active	1	GKOP	m3	2.049000
1565	FGP00695	PLYWOOD WBP 4x1220x2500	1.2200	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.012300
1566	FGP00706	ALBASIA FALCATA PLYWOOD MDF MRE 15x1220x2440	4.4652	FGP00893	FG PLYWOOD MDF MRE 15x1220x2440	4.4652	GPAK	100	Active	0	FGOD	m3	1.000000
1567	FGP00706	ALBASIA FALCATA PLYWOOD MDF MRE 15x1220x2440	4.4652	PAK00109	PACKING TUMPUK 49	100	GPAK	100	Active	1	GKPP	Set	0.044700
1568	FGP00707	FG PLYWOOD WBP 18x1220x2440	5.3582	FGP00691	PLYWOOD WBP 18x1220x2440	5.3582	FGOD	100	Active	0	PFIN	m3	1.000000
1569	FGP00719	FG PLYWOOD MRE 5x1220x2440	1.4884	FGP00006	PLYWOOD MRE 5x1220x2440	1.4884	FGOD	100	Active	0	PFIN	m3	1.000000
1570	FGP00720	ALBASIA FALCATA PLYWOOD MDF MRE 16.6x1220x2440	4.9415	FGP00723	FG PLYWOOD MDF MRE 16.6x1220x2440	4.9415	GPAK	100	Active	0	FGOD	m3	1.000000
1571	FGP00720	ALBASIA FALCATA PLYWOOD MDF MRE 16.6x1220x2440	4.9415	PAK00112	PACKING TUMPUK 41	100	GPAK	100	Active	1	GKPP	Set	0.049400
1572	FGP00721	ALBASIA FALCATA PLYWOOD RECONSTITUTED MRE 15x1220x2440	4.4652	FGP00731	FG PLYWOOD RECONSTITUTED MRE 15x1220x2440	4.4652	GPAK	100	Active	0	FGOD	m3	1.000000
1573	FGP00721	ALBASIA FALCATA PLYWOOD RECONSTITUTED MRE 15x1220x2440	4.4652	PAK00111	PACKING BERDIRI 49	100	GPAK	100	Active	1	GKPP	Set	0.044700
1574	FGP00745	ALBASIA FALCATA PLYWOOD WBP 12x1220x2440	3.5722	FGP00682	FG PLYWOOD WBP 12x1220x2440	3.5722	GPAK	100	Active	0	FGOD	m3	1.000000
1575	FGP00745	ALBASIA FALCATA PLYWOOD WBP 12x1220x2440	3.5722	PAK00077	PACKING TUMPUK 80	100	GPAK	100	Active	1	GKPP	Set	0.035700
1576	FGP00746	ALBASIA FALCATA PLYWOOD WBP 18x1220x2440	5.3582	FGP00707	FG PLYWOOD WBP 18x1220x2440	5.3582	GPAK	100	Active	0	FGOD	m3	1.000000
1577	FGP00746	ALBASIA FALCATA PLYWOOD WBP 18x1220x2440	5.3582	PAK00109	PACKING TUMPUK 49	100	GPAK	100	Active	1	GKPP	Set	0.053600
1578	FGP00747	ALBASIA FALCATA PLYWOOD WBP 19x1245x2464	5.8286	FGP00748	FG PLYWOOD WBP 19x1245x2464	5.8286	GPAK	100	Active	0	FGOD	m3	1.000000
1579	FGP00747	ALBASIA FALCATA PLYWOOD WBP 19x1245x2464	5.8286	PAK00112	PACKING TUMPUK 41	100	GPAK	100	Active	1	GKPP	Set	0.058300
1580	FGP00754	FG PLYWOOD MRE 8x1220x2500	2.4400	FGP00014	PLYWOOD MRE 8x1220x2500	2.44	FGOD	100	Active	0	PFIN	m3	1.000000
1581	FGP00758	ALBASIA FALCATA PLYWOOD MDF WBP 15x1220x2440	4.4652	FGP00711	FG PLYWOOD MDF WBP 15x1220x2440	4.4652	GPAK	100	Active	0	FGOD	m3	1.000000
1582	FGP00758	ALBASIA FALCATA PLYWOOD MDF WBP 15x1220x2440	4.4652	PAK00109	PACKING TUMPUK 49	100	GPAK	100	Active	1	GKPP	Set	0.044700
1583	FGP00773	ALBASIA FALCATA PLYWOOD WBP 9x1220x2440	2.6791	FGP00778	FG PLYWOOD WBP 9x1220x2440	2.6791	GPAK	100	Active	0	FGOD	m3	1.000000
1584	FGP00773	ALBASIA FALCATA PLYWOOD WBP 9x1220x2440	2.6791	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.026800
1585	FGP00774	ALBASIA FALCATA PLYWOOD WBP 2.7x1220x2440	0.8037	FGP00768	FG PLYWOOD WBP 2.7x1220x2440	0.8037	GPAK	100	Active	0	FGOD	m3	1.000000
1586	FGP00774	ALBASIA FALCATA PLYWOOD WBP 2.7x1220x2440	0.8037	PAK00074	PACKING TUMPUK 210	100	GPAK	100	Active	1	GKPP	Set	0.008000
1587	FGP00783	ALBASIA FALCATA PLYWOOD RECONSTITUTED MRE 15.8x1220x2440	4.7033	FGP00790	FG PLYWOOD RECONSTITUTED MRE 15.8x1220x2440	4.7033	GPAK	100	Active	0	FGOD	m3	1.000000
1588	FGP00783	ALBASIA FALCATA PLYWOOD RECONSTITUTED MRE 15.8x1220x2440	4.7033	PAK00111	PACKING BERDIRI 49	100	GPAK	100	Active	1	GKPP	Set	0.047000
1589	FGP00791	FG PLYWOOD MRE 3x1220x2440	0.8930	FGP00792	PLYWOOD MRE 3x1220x2440	0.893	FGOD	100	Active	0	PFIN	m3	1.000000
1590	FGP00792	PLYWOOD MRE 3x1220x2440	0.8930	WIV00530	VENEER LG 1.3x1220x2500	0.793	PFIN	100	Active	0	GKOP	m3	1.126100
1591	FGP00792	PLYWOOD MRE 3x1220x2440	0.8930	WIV00015	VENEER SG 2x1220x2440	0.5954	PFIN	100	Active	1	GKOP	m3	1.499800
1592	FGP00792	PLYWOOD MRE 3x1220x2440	0.8930	SUP00099	PREMIX MRE-0 1020	105.9	PFIN	100	Active	2	GKOP	Kg	0.008400
1593	FGP00805	ALBASIA FALCATA PLYWOOD RECONSTITUTED WBP 18x1220x2440	5.3582	FGP00815	FG PLYWOOD RECONSTITUTED WBP 18x1220x2440	5.3582	GPAK	100	Active	0	FGOD	m3	1.000000
1594	FGP00805	ALBASIA FALCATA PLYWOOD RECONSTITUTED WBP 18x1220x2440	5.3582	PAK00114	PACKING BERDIRI 41	100	GPAK	100	Active	1	GKPP	Set	0.053600
1595	FGP00808	FG PLYWOOD MDF WBP 18x1220x2440	5.3582	FGP00911	PLYWOOD MDF WBP 18x1220x2440	5.3582	FGOD	100	Active	0	PFIN	m3	1.000000
1596	FGP00813	ALBASIA FALCATA PLYWOOD WBP COMBICORE JABON 18x1232x2452	5.4376	FGP00820	FG PLYWOOD COMBICORE JABON WBP 18x1232x2452	5.4376	GPAK	100	Active	0	FGOD	m3	1.000000
1597	FGP00813	ALBASIA FALCATA PLYWOOD WBP COMBICORE JABON 18x1232x2452	5.4376	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.054400
1598	FGP00829	FG PLYWOOD F4 4x1220x2440	1.1907	FGP00003	PLYWOOD F4 4x1220x2440	1.1907	FGOD	100	Active	0	PFIN	m3	1.000000
1599	FGP00837	PLYWOOD COMBICORE MDF WBP 18.3x1232x2452	5.5282	RMM00012	MDF 2.5x1265x2485	1.5718	PFIN	100	Active	0	GKOP	m3	3.517100
1600	FGP00837	PLYWOOD COMBICORE MDF WBP 18.3x1232x2452	5.5282	WCP00111	CORE PLYWOOD COMBICORE WBP JABON 13.3x1220x2440	3.9591	PFIN	100	Active	1	WIPA	m3	1.396300
1601	FGP00837	PLYWOOD COMBICORE MDF WBP 18.3x1232x2452	5.5282	SUP00099	PREMIX MRE-0 1020	120	PFIN	100	Active	2	SUPP	Kg	0.046100
1602	FGP00843	ALBASIA FALCATA PLYWOOD WBP 12x1245x2464	3.6812	FGP00845	FG PLYWOOD WBP 12x1245x2464	3.6812	GPAK	100	Active	0	FGOD	m3	1.000000
1603	FGP00843	ALBASIA FALCATA PLYWOOD WBP 12x1245x2464	3.6812	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	SUPP	Set	0.036800
1604	FGP00844	PLYWOOD WBP 12x1245x2464	3.6812	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	6.034800
1605	FGP00844	PLYWOOD WBP 12x1245x2464	3.6812	WCP00100	CORE PLYWOOD WBP 10.3x1220x2440	3.0661	PFIN	100	Active	1	WIPA	m3	1.200600
1606	FGP00844	PLYWOOD WBP 12x1245x2464	3.6812	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.037200
1607	FGP00849	ALBASIA FALCATA PLYWOOD MRE COMBICORE JABON 18.3x1232x2452	5.5282	FGP00852	FG PLYWOOD COMBICORE JABON MRE 18.3x1232x2452	5.5282	GPAK	100	Active	0	FGOD	m3	1.000000
1608	FGP00849	ALBASIA FALCATA PLYWOOD MRE COMBICORE JABON 18.3x1232x2452	5.5282	PAK00112	PACKING TUMPUK 41	100	GPAK	100	Active	1	GKPP	Set	0.055300
1609	FGP00850	PLYWOOD COMBICORE JABON MRE 18.3x1232x2452	5.5282	WIV00749	VENEER SG JABON 2.2x1220x2440	1.3098	PFIN	100	Active	0	GKOP	m3	4.220600
1610	FGP00850	PLYWOOD COMBICORE JABON MRE 18.3x1232x2452	5.5282	WCP00112	CORE PLYWOOD COMBICORE MRE 14x1220x2440	4.1675	PFIN	100	Active	1	WIPA	m3	1.326500
1611	FGP00850	PLYWOOD COMBICORE JABON MRE 18.3x1232x2452	5.5282	SUP00099	PREMIX MRE-0 1020	130	PFIN	100	Active	2	GKOP	Kg	0.042500
1612	FGP00851	PLYWOOD WBP 17.5x1245x2464	5.3684	WIV00448	VENEER SG 1.7x1220x1220	0.506	PFIN	100	Active	0	GKOP	m3	10.609500
1613	FGP00851	PLYWOOD WBP 17.5x1245x2464	5.3684	WCP00032	CORE PLYWOOD WBP 16.1x1220x2440	4.7926	PFIN	100	Active	1	WIPA	m3	1.120100
1614	FGP00851	PLYWOOD WBP 17.5x1245x2464	5.3684	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.054200
1615	FGP00852	FG PLYWOOD COMBICORE JABON MRE 18.3x1232x2452	5.5282	WIV00749	VENEER SG JABON 2.2x1220x2440	1.3098	FGOD	100	Active	0	GKOP	m3	4.220600
1616	FGP00852	FG PLYWOOD COMBICORE JABON MRE 18.3x1232x2452	5.5282	WIV00752	VENEER SCRAFT LG JABON 2.2x1220x2500	0.5301	FGOD	100	Active	1	GKOP	m3	10.428600
1617	FGP00852	FG PLYWOOD COMBICORE JABON MRE 18.3x1232x2452	5.5282	WIV00011	VENEER SG 2x1220x1220	0.5954	FGOD	100	Active	2	GKOP	m3	9.284900
1618	FGP00852	FG PLYWOOD COMBICORE JABON MRE 18.3x1232x2452	5.5282	WIV00025	VENEER SG 2.6x1220x1220	1.548	FGOD	100	Active	3	GKOP	m3	3.571200
1619	FGP00852	FG PLYWOOD COMBICORE JABON MRE 18.3x1232x2452	5.5282	RMV00080	VENEER BELI LG JABON 2.2x1220x2500	2.1539	FGOD	100	Active	4	GKOP	m3	2.566600
1620	FGP00852	FG PLYWOOD COMBICORE JABON MRE 18.3x1232x2452	5.5282	SUP00099	PREMIX MRE-0 1020	390	FGOD	100	Active	5	GKOP	Kg	0.014200
1621	FGP00858	ALBASIA FALCATA PLYWOOD MRE COMBICORE JABON 18.5x1232x2452	5.5886	FGP00859	FG PLYWOOD MRE COMBICORE JABON 18.5x1232x2452	5.5886	GPAK	100	Active	0	FGOD	m3	1.000000
1622	FGP00858	ALBASIA FALCATA PLYWOOD MRE COMBICORE JABON 18.5x1232x2452	5.5886	PAK00112	PACKING TUMPUK 41	100	GPAK	100	Active	1	GKPP	Set	0.055900
1623	FGP00859	FG PLYWOOD MRE COMBICORE JABON 18.5x1232x2452	5.5886	FGP00905	PLYWOOD MRE COMBICORE JABON 18.5x1232x2452	5.5886	FGOD	100	Active	0	PFIN	m3	1.000000
1624	FGP00861	FG PLYWOOD MULTIPLEX WBP 18x1220x2400	5.2704	FGP00921	PLYWOOD MULTIPLEX WBP 18x1220x2400	5.2704	FGOD	100	Active	0	PFIN	m3	1.000000
1625	FGP00862	ALBASIA FALCATA PLYWOOD MRE COMBICORE MDF 18.5x1232x2452	5.5886	FGP00863	FG PLYWOOD MRE COMBICORE MDF 18.5x1232x2452	5.5886	GPAK	100	Active	0	FGOD	m3	1.000000
1626	FGP00862	ALBASIA FALCATA PLYWOOD MRE COMBICORE MDF 18.5x1232x2452	5.5886	PAK00112	PACKING TUMPUK 41	100	GPAK	100	Active	1	GKPP	Set	0.055900
1627	FGP00863	FG PLYWOOD MRE COMBICORE MDF 18.5x1232x2452	5.5886	FGP00922	PLYWOOD MRE COMBICORE MDF 18.5x1232x2452	5.5886	FGOD	100	Active	0	PFIN	m3	1.000000
1628	FGP00864	ALBASIA FALCATA PLYWOOD MDF MRE 3.2x1245x2464	0.9817	FGP00867	FG PLYWOOD MDF MRE 3.2x1245x2464	0.9817	GPAK	100	Active	0	FGOD	m3	1.000000
1629	FGP00864	ALBASIA FALCATA PLYWOOD MDF MRE 3.2x1245x2464	0.9817	PAK00076	PACKING TUMPUK 100	100	GPAK	100	Active	1	GKPP	Set	0.009800
1630	FGP00865	ALBASIA FALCATA PLYWOOD MDF MRE 3.4x1245x2464	1.0430	FGP00868	FG PLYWOOD MDF MRE 3.4x1245x2464	1.043	GPAK	100	Active	0	FGOD	m3	1.000000
1631	FGP00865	ALBASIA FALCATA PLYWOOD MDF MRE 3.4x1245x2464	1.0430	PAK00076	PACKING TUMPUK 100	100	GPAK	100	Active	1	GKPP	Set	0.010400
1632	FGP00866	ALBASIA FALCATA PLYWOOD MRE COMBICORE MDF 12x1245x2464	3.6812	FGP00869	FG PLYWOOD MRE COMBICORE MDF 12x1245x2464	3.6812	GPAK	100	Active	0	FGOD	m3	1.000000
1633	FGP00866	ALBASIA FALCATA PLYWOOD MRE COMBICORE MDF 12x1245x2464	3.6812	PAK00076	PACKING TUMPUK 100	100	GPAK	100	Active	1	GKPP	Set	0.036800
1634	FGP00867	FG PLYWOOD MDF MRE 3.2x1245x2464	0.9817	RMM00033	MDF 2x1265x2485	1.2574	FGOD	100	Active	0	GKOP	m3	0.780700
1635	FGP00867	FG PLYWOOD MDF MRE 3.2x1245x2464	0.9817	WIV00005	VENEER SG 1.3x1220x2440	0.387	FGOD	100	Active	1	GKOP	m3	2.536700
1636	FGP00867	FG PLYWOOD MDF MRE 3.2x1245x2464	0.9817	SUP00079	PREMIX UL MRE-0	120	FGOD	100	Active	2	GKOP	Kg	0.008200
1637	FGP00868	FG PLYWOOD MDF MRE 3.4x1245x2464	1.0430	RMM00033	MDF 2x1265x2485	1.2574	FGOD	100	Active	0	GKOP	m3	0.829500
1638	FGP00868	FG PLYWOOD MDF MRE 3.4x1245x2464	1.0430	WIV00005	VENEER SG 1.3x1220x2440	0.387	FGOD	100	Active	1	GKOP	m3	2.695100
1639	FGP00868	FG PLYWOOD MDF MRE 3.4x1245x2464	1.0430	SUP00099	PREMIX MRE-0 1020	120	FGOD	100	Active	2	GKOP	Kg	0.008700
1640	FGP00869	FG PLYWOOD MRE COMBICORE MDF 12x1245x2464	3.6812	RMM00033	MDF 2x1265x2485	1.2574	FGOD	100	Active	0	GKOP	m3	2.927600
1641	FGP00869	FG PLYWOOD MRE COMBICORE MDF 12x1245x2464	3.6812	WIV00749	VENEER SG JABON 2.2x1220x2440	1.9647	FGOD	100	Active	1	GKOP	m3	1.873700
1642	FGP00869	FG PLYWOOD MRE COMBICORE MDF 12x1245x2464	3.6812	WIV00524	VENEER LG 2x1220x2500	1.22	FGOD	100	Active	2	GKOP	m3	3.017400
1643	FGP00869	FG PLYWOOD MRE COMBICORE MDF 12x1245x2464	3.6812	SUP00099	PREMIX MRE-0 1020	360	FGOD	100	Active	3	GKOP	Kg	0.010200
1644	FGP00870	ALBASIA FALCATA PLYWOOD MULTIPLEX MRE 12x1220x2500	3.6600	FGP00872	FG PLYWOOD MULTIPLEX MRE 12x1220x2500	3.66	GPAK	100	Active	0	FGOD	m3	1.000000
1645	FGP00870	ALBASIA FALCATA PLYWOOD MULTIPLEX MRE 12x1220x2500	3.6600	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.036600
1646	FGP00871	ALBASIA FALCATA PLYWOOD MULTIPLEX MRE 15x1220x2500	4.5750	FGP00873	FG PLYWOOD MULTIPLEX MRE 15x1220x2500	4.575	GPAK	100	Active	0	FGOD	m3	1.000000
1647	FGP00871	ALBASIA FALCATA PLYWOOD MULTIPLEX MRE 15x1220x2500	4.5750	PAK00109	PACKING TUMPUK 49	100	GPAK	100	Active	1	GKPP	Set	0.045800
1648	FGP00872	FG PLYWOOD MULTIPLEX MRE 12x1220x2500	3.6600	FGP00913	PLYWOOD MULTIPLEX MRE 12x1220x2500	3.66	FGOD	100	Active	0	PFIN	m3	1.000000
1649	FGP00873	FG PLYWOOD MULTIPLEX MRE 15x1220x2500	4.5750	FGP00912	PLYWOOD MULTIPLEX MRE 15x1220x2500	4.575	FGOD	100	Active	0	PFIN	m3	1.000000
1650	FGP00874	ALBASIA FALCATA PLYWOOD MRE 16.5x1220x2440	4.9117	FGP00877	FG PLYWOOD MRE 16.5x1220x2440	4.9117	GPAK	100	Active	0	FGOD	m3	1.000000
1651	FGP00874	ALBASIA FALCATA PLYWOOD MRE 16.5x1220x2440	4.9117	PAK00109	PACKING TUMPUK 49	100	GPAK	100	Active	1	SUPP	Set	0.049100
1652	FGP00875	ALBASIA FALCATA PLYWOOD MRE 23.5x1220x2440	6.9955	FGP00878	FG PLYWOOD MRE 23.5x1220x2440	6.9955	GPAK	100	Active	0	FGOD	m3	1.000000
1653	FGP00875	ALBASIA FALCATA PLYWOOD MRE 23.5x1220x2440	6.9955	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.070000
1654	FGP00876	ALBASIA FALCATA PLYWOOD MRE 12x1220x2280	3.3379	FGP00879	FG PLYWOOD MRE 12x1220x2280	33.379	GPAK	100	Active	0	FGOD	m3	0.100000
1655	FGP00876	ALBASIA FALCATA PLYWOOD MRE 12x1220x2280	3.3379	PAK00097	PACKING TUMPUK 90	100	GPAK	100	Active	1	GKPP	Set	0.033400
1656	FGP00877	FG PLYWOOD MRE 16.5x1220x2440	4.9117	FGP00907	PLYWOOD MRE 16.5x1220x2440	1	FGOD	100	Active	0	PFIN	m3	4.911700
1657	FGP00878	FG PLYWOOD MRE 23.5x1220x2440	6.9955	FGP00906	PLYWOOD MRE 23.5x1220x2440	6.9955	FGOD	100	Active	0	PFIN	m3	1.000000
1658	FGP00879	FG PLYWOOD MRE 12x1220x2280	3.3379	FGP00904	PLYWOOD MRE 12x1220x2280	3.3379	FGOD	100	Active	0	PFIN	m3	1.000000
1659	FGP00880	ALBASIA FALCATA PLYWOOD MDF WBP 18x1232x2451	5.4353	FGP00881	FG PLYWOOD MDF WBP 18x1232x2451	5.4353	GPAK	100	Active	0	FGOD	m3	1.000000
1660	FGP00880	ALBASIA FALCATA PLYWOOD MDF WBP 18x1232x2451	5.4353	PAK00135	PACKING BERDIRI 57	100	GPAK	100	Active	1	GKPP	Set	0.054400
1661	FGP00881	FG PLYWOOD MDF WBP 18x1232x2451	5.4353	RMM00033	MDF 2x1265x2485	1.2574	FGOD	100	Active	0	GKOP	m3	4.322600
1662	FGP00881	FG PLYWOOD MDF WBP 18x1232x2451	5.4353	WIV00032	VENEER SG 2.6x1220x2440	1.548	FGOD	100	Active	1	GKOP	m3	3.511200
1663	FGP00881	FG PLYWOOD MDF WBP 18x1232x2451	5.4353	WIV00590	VENEER LG 2.6x1220x2500	2.379	FGOD	100	Active	2	GKOP	m3	2.284700
1664	FGP00881	FG PLYWOOD MDF WBP 18x1232x2451	5.4353	WIV00015	VENEER SG 2x1220x2440	1.1908	FGOD	100	Active	3	GKOP	m3	4.564400
1665	FGP00881	FG PLYWOOD MDF WBP 18x1232x2451	5.4353	SUP00075	PREMIX BONDTITE	99	FGOD	100	Active	4	GKOP	Kg	0.054900
1666	FGP00881	FG PLYWOOD MDF WBP 18x1232x2451	5.4353	SUP00099	PREMIX MRE-0 1020	240	FGOD	100	Active	5	GKOP	Kg	0.022600
1667	FGP00882	ALBASIA FALCATA PLYWOOD WBP 11.1x1257x2477	3.4561	FGP00885	FG PLYWOOD WBP 11.1x1257x2477	3.4561	GPAK	100	Active	0	FGOD	m3	1.000000
1668	FGP00882	ALBASIA FALCATA PLYWOOD WBP 11.1x1257x2477	3.4561	PAK00099	PACKING BERDIRI 90	100	GPAK	100	Active	1	GKPP	Set	0.034600
1669	FGP00883	ALBASIA FALCATA PLYWOOD WBP 23.8x1257x2477	7.4103	FGP00886	FG PLYWOOD WBP 23.8x1257x2477	7.4103	GPAK	100	Active	0	FGOD	m3	1.000000
1670	FGP00883	ALBASIA FALCATA PLYWOOD WBP 23.8x1257x2477	7.4103	PAK00136	PACKING BERDIRI 40	100	GPAK	100	Active	1	GKPP	Set	0.074100
1671	FGP00885	FG PLYWOOD WBP 11.1x1257x2477	3.4561	WIV00434	VENEER SG 1.7x1220x2440	1.0122	FGOD	100	Active	0	GKOP	m3	3.414400
1672	FGP00885	FG PLYWOOD WBP 11.1x1257x2477	3.4561	WIV00524	VENEER LG 2x1220x2500	1.83	FGOD	100	Active	1	GKOP	m3	1.888600
1673	FGP00885	FG PLYWOOD WBP 11.1x1257x2477	3.4561	WIV00448	VENEER SG 1.7x1220x1220	1.012	FGOD	100	Active	2	GKOP	m3	3.415100
1674	FGP00885	FG PLYWOOD WBP 11.1x1257x2477	3.4561	SUP00075	PREMIX BONDTITE	360	FGOD	100	Active	3	GKOP	Kg	0.009600
1675	FGP00887	ALBASIA FALCATA PLYWOOD RECONSTITUTED MRE 12x1220x2500	3.6600	FGP00888	FG PLYWOOD RECONSTITUTED MRE 12x1220x2500	3.66	GPAK	100	Active	0	FGOD	m3	1.000000
1676	FGP00887	ALBASIA FALCATA PLYWOOD RECONSTITUTED MRE 12x1220x2500	3.6600	PAK00111	PACKING BERDIRI 49	100	GPAK	100	Active	1	GKPP	Set	0.036600
1677	FGP00888	FG PLYWOOD RECONSTITUTED MRE 12x1220x2500	3.6600	FGP00914	PLYWOOD RECONSTITUTED MRE 12x1220x2500	3.66	FGOD	100	Active	0	PFIN	m3	1.000000
1678	FGP00889	ALBASIA FALCATA PLYWOOD RECONSTITUTED MRE 15x1220x2500	4.5750	FGP00890	FG PLYWOOD RECONSTITUTED MRE 15x1220x2500	4.575	GPAK	100	Active	0	FGOD	m3	1.000000
1679	FGP00889	ALBASIA FALCATA PLYWOOD RECONSTITUTED MRE 15x1220x2500	4.5750	PAK00109	PACKING TUMPUK 49	100	GPAK	100	Active	1	GKPP	Set	0.045800
1680	FGP00890	FG PLYWOOD RECONSTITUTED MRE 15x1220x2500	4.5750	FGP00915	PLYWOOD RECONSTITUTED MRE 15x1220x2500	4.575	FGOD	100	Active	0	PFIN	m3	1.000000
1681	FGP00891	ALBASIA FALCATA PLYWOOD RECONSTITUTED MRE 16x1220x2500	4.8800	FGP00892	FG PLYWOOD RECONSTITUTED MRE 16x1220x2500	4.88	GPAK	100	Active	0	FGOD	m3	1.000000
1682	FGP00891	ALBASIA FALCATA PLYWOOD RECONSTITUTED MRE 16x1220x2500	4.8800	PAK00111	PACKING BERDIRI 49	100	GPAK	100	Active	1	GKPP	Set	0.048800
1683	FGP00892	FG PLYWOOD RECONSTITUTED MRE 16x1220x2500	4.8800	FGP00916	PLYWOOD RECONSTITUTED MRE 16x1220x2500	4.88	FGOD	100	Active	0	PFIN	m3	1.000000
1684	FGP00893	FG PLYWOOD MDF MRE 15x1220x2440	4.4652	FGP00688	PLYWOOD MDF MRE 15x1220x2440	4.4652	FGOD	100	Active	0	PFIN	m3	1.000000
1685	FGP00894	ALBASIA FALCATA PLYWOOD MDF WBP 18x1251x2470	5.5619	FGP00897	FG PLYWOOD MDF WBP 18x1251x2470	5.5619	GPAK	100	Active	0	FGOD	m3	1.000000
1686	FGP00894	ALBASIA FALCATA PLYWOOD MDF WBP 18x1251x2470	5.5619	PAK00112	PACKING TUMPUK 41	100	GPAK	100	Active	1	GKPP	Set	0.055600
1687	FGP00895	ALBASIA FALCATA PLYWOOD WBP MULTIPLY COMBICORE 12x1220x2440	3.5722	FGP00898	FG PLYWOOD WBP MULTIPLY COMBICORE 12x1220x2440	3.5722	GPAK	100	Active	0	FGOD	m3	1.000000
1688	FGP00895	ALBASIA FALCATA PLYWOOD WBP MULTIPLY COMBICORE 12x1220x2440	3.5722	PAK00077	PACKING TUMPUK 80	100	GPAK	100	Active	1	GKPP	Set	0.035700
1689	FGP00896	ALBASIA FALCATA PLYWOOD MULTIPLEX COMBICORE WBP 18x1220x2440	5.3582	FGP00899	FG PLYWOOD WBP MULTIPLY COMBICORE 18x1220x2440	5.3582	GPAK	100	Active	0	FGOD	m3	1.000000
1690	FGP00896	ALBASIA FALCATA PLYWOOD MULTIPLEX COMBICORE WBP 18x1220x2440	5.3582	PAK00109	PACKING TUMPUK 49	100	GPAK	100	Active	1	GKPP	Set	0.053600
1691	FGP00897	FG PLYWOOD MDF WBP 18x1251x2470	5.5619	FGP00900	PLYWOOD MDF WBP 18x1251x2470	5.5619	FGOD	100	Active	0	PFIN	m3	1.000000
1692	FGP00898	FG PLYWOOD WBP MULTIPLY COMBICORE 12x1220x2440	3.5722	FGP00901	PLYWOOD WBP MULTIPLY COMBICORE 12x1220x2440	3.5722	FGOD	100	Active	0	PFIN	m3	1.000000
1693	FGP00899	FG PLYWOOD WBP MULTIPLY COMBICORE 18x1220x2440	5.3582	FGP00910	PLYWOOD WBP MULTIPLY COMBICORE 18x1220x2440	5.3582	FGOD	100	Active	0	PFIN	m3	1.000000
1694	FGP00901	PLYWOOD WBP MULTIPLY COMBICORE 12x1220x2440	3.5722	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	5.856100
1695	FGP00901	PLYWOOD WBP MULTIPLY COMBICORE 12x1220x2440	3.5722	WCP00113	CORE PLYWOOD WBP MULTIPLY COMBICORE 10x1220x2440	2.9768	PFIN	100	Active	1	WIPA	m3	1.200000
1696	FGP00901	PLYWOOD WBP MULTIPLY COMBICORE 12x1220x2440	3.5722	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.036100
1697	FGP00902	ALBASIA FALCATA PLYWOOD MRE 3x1220x2440	0.8930	FGP00791	FG PLYWOOD MRE 3x1220x2440	0.893	GPAK	100	Active	0	FGOD	m3	1.000000
1698	FGP00902	ALBASIA FALCATA PLYWOOD MRE 3x1220x2440	0.8930	PAK00073	PACKING TUMPUK 280	100	GPAK	100	Active	1	GKPP	Set	0.008900
1699	FGP00904	PLYWOOD MRE 12x1220x2280	3.3379	WIV00048	VENEER LG 1x1220x2300	0.5612	PFIN	100	Active	0	GKOP	m3	5.947800
1700	FGP00904	PLYWOOD MRE 12x1220x2280	3.3379	WCP00115	CORE PLYWOOD MRE 10.3x1220x2300	2.8902	PFIN	100	Active	1	WIPA	m3	1.154900
1701	FGP00904	PLYWOOD MRE 12x1220x2280	3.3379	SUP00099	PREMIX MRE-0 1020	110	PFIN	100	Active	2	GKOP	Kg	0.030300
1702	FGP00905	PLYWOOD MRE COMBICORE JABON 18.5x1232x2452	5.5886	WIV00749	VENEER SG JABON 2.2x1220x2440	1.3098	PFIN	100	Active	0	GKOP	m3	4.266800
1703	FGP00905	PLYWOOD MRE COMBICORE JABON 18.5x1232x2452	5.5886	WCP00117	CORE PLYWOOD COMBICORE MRE JABON 16.3x1232x2452	4.924	PFIN	100	Active	1	WIPA	m3	1.135000
1704	FGP00905	PLYWOOD MRE COMBICORE JABON 18.5x1232x2452	5.5886	SUP00099	PREMIX MRE-0 1020	120	PFIN	100	Active	2	GKOP	Kg	0.046600
1705	FGP00906	PLYWOOD MRE 23.5x1220x2440	6.9955	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	11.468000
1706	FGP00906	PLYWOOD MRE 23.5x1220x2440	6.9955	WCP00009	CORE PLYWOOD MRE 21x1220x2440	6.2513	PFIN	100	Active	1	WIPA	m3	1.119000
1707	FGP00906	PLYWOOD MRE 23.5x1220x2440	6.9955	SUP00099	PREMIX MRE-0 1020	102.5	PFIN	100	Active	2	GKOP	Kg	0.068200
1708	FGP00907	PLYWOOD MRE 16.5x1220x2440	4.9117	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	8.052000
1709	FGP00907	PLYWOOD MRE 16.5x1220x2440	4.9117	WCP00120	CORE PLYWOOD MRE 14.5x1220x2440	4.3164	PFIN	100	Active	1	WIPA	m3	1.137900
1710	FGP00907	PLYWOOD MRE 16.5x1220x2440	4.9117	SUP00099	PREMIX MRE-0 1020	110	PFIN	100	Active	2	SUPP	Kg	0.044700
1711	FGP00910	PLYWOOD WBP MULTIPLY COMBICORE 18x1220x2440	5.3582	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	8.783900
1712	FGP00910	PLYWOOD WBP MULTIPLY COMBICORE 18x1220x2440	5.3582	WCP00121	CORE PLYWOOD WBP MULTIPLY COMBICORE 16x1220x2440	4.7629	PFIN	100	Active	1	WIPA	m3	1.125000
1713	FGP00910	PLYWOOD WBP MULTIPLY COMBICORE 18x1220x2440	5.3582	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.054100
1714	FGP00911	PLYWOOD MDF WBP 18x1220x2440	5.3582	RMM00033	MDF 2x1265x2485	1.2574	PFIN	100	Active	0	WADA	m3	4.261300
1715	FGP00911	PLYWOOD MDF WBP 18x1220x2440	5.3582	WCP00122	CORE PLYWOOD WBP 14.5x1220x2440	4.3164	PFIN	100	Active	1	WIPA	m3	1.241400
1716	FGP00911	PLYWOOD MDF WBP 18x1220x2440	5.3582	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.054100
1717	FGP00912	PLYWOOD MULTIPLEX MRE 15x1220x2500	4.5750	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	7.500000
1718	FGP00912	PLYWOOD MULTIPLEX MRE 15x1220x2500	4.5750	WCP00123	CORE PLYWOOD MULTIPLEX MRE 13x1220x2500	3.965	PFIN	100	Active	1	WIPA	m3	1.153800
1719	FGP00912	PLYWOOD MULTIPLEX MRE 15x1220x2500	4.5750	SUP00099	PREMIX MRE-0 1020	105.6	PFIN	100	Active	2	GKOP	Kg	0.043300
1720	FGP00913	PLYWOOD MULTIPLEX MRE 12x1220x2500	3.6600	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	WIVE	m3	6.000000
1721	FGP00913	PLYWOOD MULTIPLEX MRE 12x1220x2500	3.6600	WCP00124	CORE PLYWOOD MULTIPLEX MRE 10x1220x2500	3.05	PFIN	100	Active	1	WIPA	m3	1.200000
1722	FGP00913	PLYWOOD MULTIPLEX MRE 12x1220x2500	3.6600	SUP00099	PREMIX MRE-0 1020	120	PFIN	100	Active	2	SUPP	Kg	0.030500
1723	FGP00914	PLYWOOD RECONSTITUTED MRE 12x1220x2500	3.6600	RMV00063	VENEER BELI LG RECONSTITUTED POPLAR 1x1280x2500	0.64	PFIN	100	Active	0	GKOP	m3	5.718800
1724	FGP00914	PLYWOOD RECONSTITUTED MRE 12x1220x2500	3.6600	WCP00125	CORE PLYWOOD RECONSTITUTED MRE 10x1220x2500	3.05	PFIN	100	Active	1	WIPA	m3	1.200000
1725	FGP00914	PLYWOOD RECONSTITUTED MRE 12x1220x2500	3.6600	SUP00099	PREMIX MRE-0 1020	120	PFIN	100	Active	2	GKOP	Kg	0.030500
1726	FGP00915	PLYWOOD RECONSTITUTED MRE 15x1220x2500	4.5750	RMV00063	VENEER BELI LG RECONSTITUTED POPLAR 1x1280x2500	0.64	PFIN	100	Active	0	GKOP	m3	7.148400
1727	FGP00915	PLYWOOD RECONSTITUTED MRE 15x1220x2500	4.5750	WCP00126	CORE PLYWOOD RECONSTITUTED MRE 13x1220x2500	4.0443	PFIN	100	Active	1	WIPA	m3	1.131200
1728	FGP00915	PLYWOOD RECONSTITUTED MRE 15x1220x2500	4.5750	SUP00099	PREMIX MRE-0 1020	120	PFIN	100	Active	2	GKOP	Kg	0.038100
1729	FGP00916	PLYWOOD RECONSTITUTED MRE 16x1220x2500	4.8800	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	8.000000
1730	FGP00916	PLYWOOD RECONSTITUTED MRE 16x1220x2500	4.8800	WCP00127	CORE PLYWOOD RECONSTITUTED MRE 14x1220x2500	4.27	PFIN	100	Active	1	WIPA	m3	1.142900
1731	FGP00916	PLYWOOD RECONSTITUTED MRE 16x1220x2500	4.8800	SUP00099	PREMIX MRE-0 1020	120	PFIN	100	Active	2	GKOP	Kg	0.040700
1732	FGP00917	ALBASIA FALCATA PLYWOOD WBP 40x1040x2440	10.1504	FGP00919	FG PLYWOOD WBP 40x1040x2440	10.1504	GPAK	100	Active	0	FGOD	m3	1.000000
1733	FGP00917	ALBASIA FALCATA PLYWOOD WBP 40x1040x2440	10.1504	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.101500
1734	FGP00918	PLYWOOD MULTIPLEX MRE 18x1220x2440	5.3582	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	8.783900
1735	FGP00918	PLYWOOD MULTIPLEX MRE 18x1220x2440	5.3582	WCP00079	CORE PLYWOOD MRE 16.3x1220x2440	4.8522	PFIN	100	Active	1	WIPA	m3	1.104300
1736	FGP00918	PLYWOOD MULTIPLEX MRE 18x1220x2440	5.3582	SUP00075	PREMIX BONDTITE	200	PFIN	100	Active	2	GKOP	Kg	0.026800
1737	FGP00919	FG PLYWOOD WBP 40x1040x2440	10.1504	FGP00920	PLYWOOD WBP 40x1040x2440	10.1504	FGOD	100	Active	0	PFIN	m3	1.000000
1738	FGP00920	PLYWOOD WBP 40x1040x2440	10.1504	WIV00530	VENEER LG 1.3x1220x2500	0.793	PFIN	100	Active	0	GKOP	m3	12.800000
1739	FGP00920	PLYWOOD WBP 40x1040x2440	10.1504	WCP00129	CORE PLYWOOD WBP 38x1040x2440	9.6429	PFIN	100	Active	1	WIPA	m3	1.052600
1740	FGP00920	PLYWOOD WBP 40x1040x2440	10.1504	SUP00075	PREMIX BONDTITE	102.5	PFIN	100	Active	2	GKOP	Kg	0.099000
1741	FGP00921	PLYWOOD MULTIPLEX WBP 18x1220x2400	5.2704	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	8.640000
1742	FGP00921	PLYWOOD MULTIPLEX WBP 18x1220x2400	5.2704	WCP00130	CORE PLYWOOD MULTIPLEX WBP 16x1220x2400	4.6848	PFIN	100	Active	1	WIPA	m3	1.125000
1743	FGP00921	PLYWOOD MULTIPLEX WBP 18x1220x2400	5.2704	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.053200
1744	FGP00922	PLYWOOD MRE COMBICORE MDF 18.5x1232x2452	5.5886	RMM00033	MDF 2x1265x2485	1.2574	PFIN	100	Active	0	GKOP	m3	4.444600
1745	FGP00922	PLYWOOD MRE COMBICORE MDF 18.5x1232x2452	5.5886	WCP00131	CORE PLYWOOD MRE COMBICORE 16x1232x2452	4.8334	PFIN	100	Active	1	WIPA	m3	1.156200
1746	FGP00922	PLYWOOD MRE COMBICORE MDF 18.5x1232x2452	5.5886	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.056500
1747	FGP00923	FG PLYWOOD MDF MRE 12x1225x2440	3.5868	FGP00206	PLYWOOD MDF MRE 12x1225x2440	3.5868	FGOD	100	Active	0	PFIN	m3	1.000000
1748	FGP00924	ALBASIA FALCATA PLYWOOD MRE UTY 5x1220x2440	1.4884	FGP00925	FG PLYWOOD MRE UTY 5x1220x2440	1.4884	GPAK	100	Active	0	FGOD	m3	1.000000
1749	FGP00924	ALBASIA FALCATA PLYWOOD MRE UTY 5x1220x2440	1.4884	PAK00075	PACKING TUMPUK 150	100	GPAK	100	Active	1	GKPP	Set	0.014900
1750	FGP00925	FG PLYWOOD MRE UTY 5x1220x2440	1.4884	FGP00926	PLATFORM PLYWOOD MRE UTY 5x1220x2440	1.4884	FGOD	100	Active	0	PFIN	m3	1.000000
1751	FGP00929	FG PLYWOOD MRE UTY 4x1220x2500	1.2200	FGP00930	PLATFORM PLYWOOD MRE UTY 4x1220x2500	1.22	FGOD	100	Active	0	PFIN	m3	1.000000
1752	FGP00932	ALBASIA FALCATA PLYWOOD MRE UTY 4x1220x2500	1.2200	FGP00929	FG PLYWOOD MRE UTY 4x1220x2500	1.22	GPAK	100	Active	0	FGOD	m3	1.000000
1753	FGP00932	ALBASIA FALCATA PLYWOOD MRE UTY 4x1220x2500	1.2200	PAK00088	PACKING TUMPUK 180	100	GPAK	100	Active	1	GKPP	Set	0.012200
1754	FGP00933	ALBASIA FALCATA PLYWOOD WBP COMBICORE MULTIPLEX 18.5x1220x2440	5.5071	FGP00934	FG PLYWOOD WBP COMBICORE MULTIPLEX 18.5x1220x2440	1	GPAK	100	Active	0	FGOD	m3	5.507100
1755	FGP00933	ALBASIA FALCATA PLYWOOD WBP COMBICORE MULTIPLEX 18.5x1220x2440	5.5071	PAK00112	PACKING TUMPUK 41	100	GPAK	100	Active	1	GKPP	Set	0.055100
1756	FGP00934	FG PLYWOOD WBP COMBICORE MULTIPLEX 18.5x1220x2440	5.5071	FGP00935	PLYWOOD WBP COMBICORE MULTIPLEX 18.5x1220x2440	5.5071	FGOD	100	Active	0	PFIN	m3	1.000000
1757	FGP00935	PLYWOOD WBP COMBICORE MULTIPLEX 18.5x1220x2440	5.5071	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	9.028000
1758	FGP00935	PLYWOOD WBP COMBICORE MULTIPLEX 18.5x1220x2440	5.5071	WCP00121	CORE PLYWOOD WBP COMBICORE MULTIPLEX 16x1220x2440	4.7629	PFIN	100	Active	1	WIPA	m3	1.156200
1759	FGP00935	PLYWOOD WBP COMBICORE MULTIPLEX 18.5x1220x2440	5.5071	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.055600
1760	FGP00945	ALBASIA FALCATA PLYWOOD MULTIPLEX MRE 9x1220x2500	2.7450	FGP00953	FG PLYWOOD MULTIPLEX MRE 9x1220x2500	2.745	GPAK	100	Active	0	FGOD	m3	1.000000
1761	FGP00945	ALBASIA FALCATA PLYWOOD MULTIPLEX MRE 9x1220x2500	2.7450	PAK00100	PACKING TUMPUK P.2500/80	100	GPAK	100	Active	1	GKPP	Set	0.027500
1762	FGP00946	ALBASIA FALCATA PLYWOOD MULTIPLEX MRE 18x1220x2500	5.4900	FGP00952	FG PLYWOOD MULTIPLEX MRE 18x1220x2500	5.49	GPAK	100	Active	0	FGOD	m3	1.000000
1763	FGP00946	ALBASIA FALCATA PLYWOOD MULTIPLEX MRE 18x1220x2500	5.4900	PAK00112	PACKING TUMPUK 41	100	GPAK	100	Active	1	GKPP	Set	0.054900
1764	FGP00948	ALBASIA FALCATA PLYWOOD WBP RED PAINT 19.1x1245x2464	5.8593	FGP00964	FG PLYWOOD WBP COATING 19.1x1245x2464	5.8593	GPAK	100	Active	0	PVAF	m3	1.000000
1765	FGP00948	ALBASIA FALCATA PLYWOOD WBP RED PAINT 19.1x1245x2464	5.8593	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.058600
1766	FGP00950	PLYWOOD MULTIPLEX WBP 18x1220x2440	5.3582	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	8.783900
1767	FGP00950	PLYWOOD MULTIPLEX WBP 18x1220x2440	5.3582	WCP00137	CORE PLYWOOD MULTIPLEX WBP 16x1220x2440	4.7629	PFIN	100	Active	1	WIPA	m3	1.125000
1768	FGP00950	PLYWOOD MULTIPLEX WBP 18x1220x2440	5.3582	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.054100
1769	FGP00951	PLYWOOD MULTIPLEX MRE 18x1220x2500	5.4900	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	WIVE	m3	9.000000
1770	FGP00951	PLYWOOD MULTIPLEX MRE 18x1220x2500	5.4900	WCP00138	CORE PLYWOOD MULTIPLEX MRE 16x1220x2500	4.88	PFIN	100	Active	1	WIPA	m3	1.125000
1771	FGP00951	PLYWOOD MULTIPLEX MRE 18x1220x2500	5.4900	SUP00099	PREMIX MRE-0 1020	110	PFIN	100	Active	2	SUPP	Kg	0.049900
1772	FGP00952	FG PLYWOOD MULTIPLEX MRE 18x1220x2500	5.4900	FGP00951	PLYWOOD MULTIPLEX MRE 18x1220x2500	5.49	FGOD	100	Active	0	PFIN	m3	1.000000
1773	FGP00953	FG PLYWOOD MULTIPLEX MRE 9x1220x2500	2.7450	FGP00954	PLYWOOD MULTIPLEX MRE 9x1220x2500	2.745	FGOD	100	Active	0	PFIN	m3	1.000000
1774	FGP00954	PLYWOOD MULTIPLEX MRE 9x1220x2500	2.7450	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	4.500000
1775	FGP00954	PLYWOOD MULTIPLEX MRE 9x1220x2500	2.7450	WCP00026	CORE PLYWOOD MULTIPLY MRE 7x1220x2500	2.135	PFIN	100	Active	1	WIPA	m3	1.285700
1776	FGP00954	PLYWOOD MULTIPLEX MRE 9x1220x2500	2.7450	SUP00099	PREMIX MRE-0 1020	110	PFIN	100	Active	2	GKOP	Kg	0.025000
1777	FGP00955	ALBASIA FALCATA PLYWOOD MRE 18x920x2135	3.5356	FGP00993	FG PLYWOOD MRE 18x920x2135	3.5356	GPAK	100	Active	0	FGOD	m3	1.000000
1778	FGP00955	ALBASIA FALCATA PLYWOOD MRE 18x920x2135	3.5356	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	SUPP	Set	0.035400
1779	FGP00956	FG PLYWOOD MULTIPLEX WBP 18x1220x2440	5.3582	FGP00950	PLYWOOD MULTIPLEX WBP 18x1220x2440	5.3582	FGOD	100	Active	0	PFIN	m3	1.000000
1780	FGP00957	ALBASIA FALCATA PLYWOOD MULTIPLEX WBP 18x1220x2440	5.3582	FGP00956	FG PLYWOOD MULTIPLEX WBP 18x1220x2440	5.3582	GPAK	100	Active	0	FGOD	m3	1.000000
1781	FGP00962	ALBASIA FALCATA PLYWOOD MULTIPLEX WBP 12x1220x2440	3.5722	FGP00969	FG PLYWOOD MULTIPLEX WBP 12x1220x2440	3.5722	GPAK	100	Active	0	FGOD	m3	1.000000
1782	FGP00962	ALBASIA FALCATA PLYWOOD MULTIPLEX WBP 12x1220x2440	3.5722	PAK00106	PACKING TUMPUK 61	100	GPAK	100	Active	1	GKPP	Set	0.035700
1783	FGP00963	ALBASIA FALCATA PLYWOOD MULTIPLEX WBP 15x1220x2440	4.4652	FGP00971	FG PLYWOOD MULTIPLEX WBP 15x1220x2440	4.4652	GPAK	100	Active	0	FGOD	m3	1.000000
1784	FGP00963	ALBASIA FALCATA PLYWOOD MULTIPLEX WBP 15x1220x2440	4.4652	PAK00109	PACKING TUMPUK 49	100	GPAK	100	Active	1	SUPP	Set	0.044700
1785	FGP00964	FG PLYWOOD WBP COATING 19.1x1245x2464	5.8593	FGP00966	PLYWOOD WBP 19.1x1245x2464	5.8593	PVAF	100	Active	0	PFIN	m3	1.000000
1786	FGP00964	FG PLYWOOD WBP COATING 19.1x1245x2464	5.8593	SUP00146	KERNIK FLAME RETERDANT, BC 23	0.06	PVAF	100	Active	1	SUPP	kg	97.655000
1787	FGP00965	FG PLYWOOD WBP 19.1x1245x2464	5.8593	FGP00966	PLYWOOD WBP 19.1x1245x2464	5.8593	FGOD	100	Active	0	PFIN	m3	1.000000
1788	FGP00966	PLYWOOD WBP 19.1x1245x2464	5.8593	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	9.605400
1789	FGP00966	PLYWOOD WBP 19.1x1245x2464	5.8593	WCP00139	CORE PLYWOOD WBP 17.1x1245x2464	5.2457	PFIN	100	Active	1	WIPA	m3	1.117000
1790	FGP00966	PLYWOOD WBP 19.1x1245x2464	5.8593	SUP00075	PREMIX BONDTITE	105.9	PFIN	100	Active	2	GKOP	Kg	0.055300
1791	FGP00969	FG PLYWOOD MULTIPLEX WBP 12x1220x2440	3.5722	FGP00970	PLYWOOD MULTIPLEX WBP 12x1220x2440	3.5722	FGOD	100	Active	0	PFIN	m3	1.000000
1792	FGP00970	PLYWOOD MULTIPLEX WBP 12x1220x2440	3.5722	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	5.856100
1793	FGP00970	PLYWOOD MULTIPLEX WBP 12x1220x2440	3.5722	WCP00100	CORE PLYWOOD WBP 10.3x1220x2440	3.0661	PFIN	100	Active	1	WIPA	m3	1.165100
1794	FGP00970	PLYWOOD MULTIPLEX WBP 12x1220x2440	3.5722	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.036100
1795	FGP00971	FG PLYWOOD MULTIPLEX WBP 15x1220x2440	4.4652	FGP00972	PLYWOOD MULTIPLEX WBP 15x1220x2440	4.4652	FGOD	100	Active	0	PFIN	m3	1.000000
1796	FGP00972	PLYWOOD MULTIPLEX WBP 15x1220x2440	4.4652	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	7.320000
1797	FGP00972	PLYWOOD MULTIPLEX WBP 15x1220x2440	4.4652	WCP00140	CORE PLYWOOD MULTIPLEX WBP 13.3x1220x2440	3.9591	PFIN	100	Active	1	WIPA	m3	1.127800
1798	FGP00972	PLYWOOD MULTIPLEX WBP 15x1220x2440	4.4652	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.045100
1799	FGP00973	ALBASIA FALCATA PLYWOOD MRE 16.5x1225x2445	4.9420	FGP00995	FG PLYWOOD MRE 16.5x1225x2445	4.942	GPAK	100	Active	0	FGOD	m3	1.000000
1800	FGP00973	ALBASIA FALCATA PLYWOOD MRE 16.5x1225x2445	4.9420	PAK00135	PACKING BERDIRI 57	100	GPAK	100	Active	1	SUPP	Set	0.049400
1801	FGP00974	ALBASIA FALCATA PLYWOOD MRE 40x1000x2400	9.6000	FGP00979	FG PLYWOOD MRE 40x1000x2400	9.6	GPAK	100	Active	0	FGOD	m3	1.000000
1802	FGP00974	ALBASIA FALCATA PLYWOOD MRE 40x1000x2400	9.6000	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.096000
1803	FGP00975	ALBASIA FALCATA PLYWOOD MRE 30x1220x2440	8.9304	FGP00977	FG PLYWOOD MRE 30x1220x2440	8.9304	GPAK	100	Active	0	FGOD	m3	1.000000
1804	FGP00975	ALBASIA FALCATA PLYWOOD MRE 30x1220x2440	8.9304	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	GKPP	Set	0.089300
1805	FGP00976	ALBASIA FALCATA PLYWOOD MRE 50x1220x2440	14.8840	FGP00981	FG PLYWOOD MRE 50x1220x2440	14.884	GPAK	100	Active	0	FGOD	m3	1.000000
1806	FGP00976	ALBASIA FALCATA PLYWOOD MRE 50x1220x2440	14.8840	PAK00082	PACKING TUMPUK 25	100	GPAK	100	Active	1	SUPP	Set	0.148800
1807	FGP00977	FG PLYWOOD MRE 30x1220x2440	8.9304	FGP00978	PLYWOOD MRE 30x1220x2440	8.9304	FGOD	100	Active	0	PFIN	m3	1.000000
1808	FGP00978	PLYWOOD MRE 30x1220x2440	8.9304	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	14.640000
1809	FGP00978	PLYWOOD MRE 30x1220x2440	8.9304	WCP00141	CORE PLYWOOD MRE 28x1220x2440	8.335	PFIN	100	Active	1	WIPA	m3	1.071400
1810	FGP00978	PLYWOOD MRE 30x1220x2440	8.9304	SUP00099	PREMIX MRE-0 1020	105.9	PFIN	100	Active	2	GKOP	Kg	0.084300
1811	FGP00979	FG PLYWOOD MRE 40x1000x2400	9.6000	FGP00980	PLYWOOD MRE 40x1000x2400	9.6	FGOD	100	Active	0	PFIN	m3	1.000000
1812	FGP00980	PLYWOOD MRE 40x1000x2400	9.6000	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	15.737700
1813	FGP00980	PLYWOOD MRE 40x1000x2400	9.6000	WCP00142	CORE PLYWOOD MRE 38x1000x2400	9.12	PFIN	100	Active	1	WIPA	m3	1.052600
1814	FGP00980	PLYWOOD MRE 40x1000x2400	9.6000	SUP00099	PREMIX MRE-0 1020	105.9	PFIN	100	Active	2	GKOP	Kg	0.090700
1815	FGP00981	FG PLYWOOD MRE 50x1220x2440	14.8840	WIV00527	VENEER LG 1x1220x2500	0.61	FGOD	100	Active	0	GKOP	m3	24.400000
1816	FGP00981	FG PLYWOOD MRE 50x1220x2440	14.8840	FGP00982	PLYWOOD MRE 50x1220x2440	14.884	FGOD	100	Active	1	PFIN	m3	1.000000
1817	FGP00981	FG PLYWOOD MRE 50x1220x2440	14.8840	SUP00099	PREMIX MRE-0 1020	105.9	FGOD	100	Active	2	GKOP	Kg	0.140500
1818	FGP00982	PLYWOOD MRE 50x1220x2440	14.8840	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	24.400000
1819	FGP00982	PLYWOOD MRE 50x1220x2440	14.8840	WCP00143	CORE PLYWOOD MRE 48x1220x2440	14.2886	PFIN	100	Active	1	WIPA	m3	1.041700
1820	FGP00982	PLYWOOD MRE 50x1220x2440	14.8840	SUP00099	PREMIX MRE-0 1020	105.9	PFIN	100	Active	2	GKOP	Kg	0.140500
1821	FGP00983	ALBASIA FALCATA PLYWOOD WBP 3x1220x2500	0.9150	FGP01002	FG PLYWOOD WBP 3x1220x2500	0.915	GPAK	100	Active	0	FGOD	m3	1.000000
1822	FGP00983	ALBASIA FALCATA PLYWOOD WBP 3x1220x2500	0.9150	PAK00074	PACKING TUMPUK 210	100	GPAK	100	Active	1	SUPP	Set	0.009200
1823	FGP00984	ALBASIA FALCATA PLYWOOD WBP 4x1220x2500	1.2200	FGP01004	FG PLYWOOD WBP 4x1220x2500	1.22	GPAK	100	Active	0	FGOD	m3	1.000000
1824	FGP00984	ALBASIA FALCATA PLYWOOD WBP 4x1220x2500	1.2200	PAK00076	PACKING TUMPUK 100	100	GPAK	100	Active	1	SUPP	Set	0.012200
1825	FGP00985	ALBASIA FALCATA PLYWOOD WBP 6x1220x2500	1.8300	FGP01005	FG PLYWOOD WBP 6x1220x2500	1	GPAK	100	Active	0	FGOD	m3	1.830000
1826	FGP00985	ALBASIA FALCATA PLYWOOD WBP 6x1220x2500	1.8300	PAK00075	PACKING TUMPUK 150	100	GPAK	100	Active	1	SUPP	Set	0.018300
1827	FGP00986	ALBASIA FALCATA PLYWOOD WBP 8x1220x2500	2.4400	FGP00224	FG PLYWOOD WBP 8x1220x2500	2.44	GPAK	100	Active	0	FGOD	m3	1.000000
1828	FGP00986	ALBASIA FALCATA PLYWOOD WBP 8x1220x2500	2.4400	PAK00076	PACKING TUMPUK 100	100	GPAK	100	Active	1	SUPP	Set	0.024400
1829	FGP00987	ALBASIA FALCATA PLYWOOD WBP 10x1220x2500	3.0500	FGP01008	FG PLYWOOD WBP 10x1220x2500	1	GPAK	100	Active	0	FGOD	m3	3.050000
1830	FGP00987	ALBASIA FALCATA PLYWOOD WBP 10x1220x2500	3.0500	PAK00088	PACKING TUMPUK 180	100	GPAK	100	Active	1	SUPP	Set	0.030500
1831	FGP00988	ALBASIA FALCATA PLYWOOD WBP 12x1220x2500	3.6600	FGP01010	FG PLYWOOD WBP 12x1220x2500	3.66	GPAK	100	Active	0	FGOD	m3	1.000000
1832	FGP00988	ALBASIA FALCATA PLYWOOD WBP 12x1220x2500	3.6600	PAK00103	PACKING TUMPUK 73	100	GPAK	100	Active	1	GKPP	Set	0.036600
1833	FGP00989	ALBASIA FALCATA PLYWOOD WBP 15x1220x2500	4.5750	FGP01012	FG PLYWOOD WBP 15x1220x2500	4.575	GPAK	100	Active	0	FGOD	m3	1.000000
1834	FGP00989	ALBASIA FALCATA PLYWOOD WBP 15x1220x2500	4.5750	PAK00108	PACKING BERDIRI 61	100	GPAK	100	Active	1	SUPP	Set	0.045800
1835	FGP00990	ALBASIA FALCATA PLYWOOD WBP 18x1220x2500	5.4900	FGP01013	FG PLYWOOD WBP 18x1220x2500	5.49	GPAK	100	Active	0	FGOD	m3	1.000000
1836	FGP00990	ALBASIA FALCATA PLYWOOD WBP 18x1220x2500	5.4900	PAK00114	PACKING BERDIRI 41	100	GPAK	100	Active	1	GKPP	Set	0.054900
1837	FGP00991	ALBASIA FALCATA PLYWOOD WBP 25x1220x2500	7.6250	FGP01018	FG PLYWOOD WBP 25x1220x2500	7.625	GPAK	100	Active	0	FGOD	m3	1.000000
1838	FGP00991	ALBASIA FALCATA PLYWOOD WBP 25x1220x2500	7.6250	PAK00121	PACKING TUMPUK 30	100	GPAK	100	Active	1	SUPP	Set	0.076300
1839	FGP00992	ALBASIA FALCATA PLYWOOD WBP 30x1220x2500	9.1500	FGP01015	FG PLYWOOD WBP 30x1220x2500	9.15	GPAK	100	Active	0	FGOD	m3	1.000000
1840	FGP00992	ALBASIA FALCATA PLYWOOD WBP 30x1220x2500	9.1500	PAK00111	PACKING BERDIRI 49	100	GPAK	100	Active	1	SUPP	Set	0.091500
1841	FGP00993	FG PLYWOOD MRE 18x920x2135	3.5356	FGP00994	PLYWOOD MRE 18x920x2135	3.5356	FGOD	100	Active	0	PFIN	m3	1.000000
1842	FGP00994	PLYWOOD MRE 18x920x2135	3.5356	WIV00046	VENEER LG 1x930x2200	0.4092	PFIN	100	Active	0	GKOP	m3	8.640300
1843	FGP00994	PLYWOOD MRE 18x920x2135	3.5356	WCP00144	CORE PLYWOOD MRE 16.3x920x2135	3.2016	PFIN	100	Active	1	WIPA	m3	1.104300
1844	FGP00994	PLYWOOD MRE 18x920x2135	3.5356	SUP00073	PREMIX UL MRE-1	105.9	PFIN	100	Active	2	GKOP	Kg	0.033400
1845	FGP00995	FG PLYWOOD MRE 16.5x1225x2445	4.9420	FGP00997	PLYWOOD MRE 16.5x1225x2445	1	FGOD	100	Active	0	PFIN	m3	4.942000
1846	FGP00997	PLYWOOD MRE 16.5x1225x2445	4.9420	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	8.101600
1847	FGP00997	PLYWOOD MRE 16.5x1225x2445	4.9420	WCP00145	CORE PLYWOOD MRE 14.5x1225x2445	4.3429	PFIN	100	Active	1	WIPA	m3	1.137900
1848	FGP00997	PLYWOOD MRE 16.5x1225x2445	4.9420	SUP00099	PREMIX MRE-0 1020	105.9	PFIN	100	Active	2	GKOP	Kg	0.046700
1849	FGP00999	ALBASIA FALCATA PLYWOOD COMBICORE MDF WBP 18x1220x2440	5.5282	FGP01000	FG PLYWOOD WBP COMBICORE MDF 18x1220x2440	5.3582	GPAK	100	Active	0	FGOD	m3	1.031700
1850	FGP00999	ALBASIA FALCATA PLYWOOD COMBICORE MDF WBP 18x1220x2440	5.5282	PAK00113	PACKING TUMPUK SEPATU 41	100	GPAK	100	Active	1	GKPP	Set	0.055300
1851	FGP01000	FG PLYWOOD WBP COMBICORE MDF 18x1220x2440	5.3582	FGP01001	PLYWOOD WBP COMBICORE MDF 18x1220x2440	5.3582	FGOD	100	Active	0	PFIN	m3	1.000000
1852	FGP01001	PLYWOOD WBP COMBICORE MDF 18x1220x2440	5.3582	RMM00033	MDF 2x1265x2485	1.2574	PFIN	100	Active	0	GKOP	m3	4.261300
1853	FGP01001	PLYWOOD WBP COMBICORE MDF 18x1220x2440	5.3582	WCP00034	CORE PLYWOOD COMBICORE WBP 14x1220x2440	4.1675	PFIN	100	Active	1	WIPA	m3	1.285700
1854	FGP01001	PLYWOOD WBP COMBICORE MDF 18x1220x2440	5.3582	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.054100
1855	FGP01002	FG PLYWOOD WBP 3x1220x2500	0.9150	FGP01003	PLYWOOD WBP 3x1220x2500	0.915	FGOD	100	Active	0	PFIN	m3	1.000000
1856	FGP01003	PLYWOOD WBP 3x1220x2500	0.9150	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	1.500000
1857	FGP01003	PLYWOOD WBP 3x1220x2500	0.9150	WIV00015	VENEER SG 2x1220x2440	0.5954	PFIN	100	Active	1	GKOP	m3	1.536800
1858	FGP01003	PLYWOOD WBP 3x1220x2500	0.9150	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.009200
1859	FGP01004	FG PLYWOOD WBP 4x1220x2500	1.2200	FGP00695	PLYWOOD WBP 4x1220x2500	1.22	FGOD	100	Active	0	PFIN	m3	1.000000
1860	FGP01005	FG PLYWOOD WBP 6x1220x2500	1.8300	FGP01006	PLYWOOD WBP 6x1220x2500	1.83	FGOD	100	Active	0	PFIN	m3	1.000000
1861	FGP01006	PLYWOOD WBP 6x1220x2500	1.8300	WIV00524	VENEER LG 2x1220x2500	1.22	PFIN	100	Active	0	GKOP	m3	1.500000
1862	FGP01006	PLYWOOD WBP 6x1220x2500	1.8300	WIV00032	VENEER SG 2.6x1220x2440	0.774	PFIN	100	Active	1	GKOP	m3	2.364300
1863	FGP01006	PLYWOOD WBP 6x1220x2500	1.8300	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.018500
1864	FGP01007	PLYWOOD WBP 8x1220x2500	2.4400	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	4.000000
1865	FGP01007	PLYWOOD WBP 8x1220x2500	2.4400	WCP00146	CORE PLYWOOD WBP 6x1220x2500	1.83	PFIN	100	Active	1	WIPA	m3	1.333300
1866	FGP01007	PLYWOOD WBP 8x1220x2500	2.4400	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.024600
1867	FGP01008	FG PLYWOOD WBP 10x1220x2500	3.0500	FGP01009	PLYWOOD WBP 10x1220x2500	3.05	FGOD	100	Active	0	PFIN	m3	1.000000
1868	FGP01009	PLYWOOD WBP 10x1220x2500	3.0500	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	5.000000
1869	FGP01009	PLYWOOD WBP 10x1220x2500	3.0500	WCP00147	CORE PLYWOOD WBP 8x1220x2500	2.44	PFIN	100	Active	1	WIPA	m3	1.250000
1870	FGP01009	PLYWOOD WBP 10x1220x2500	3.0500	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.030800
1871	FGP01010	FG PLYWOOD WBP 12x1220x2500	3.6600	FGP01011	PLYWOOD WBP 12x1220x2500	3.66	FGOD	100	Active	0	PFIN	m3	1.000000
1872	FGP01011	PLYWOOD WBP 12x1220x2500	3.6600	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	6.000000
1873	FGP01011	PLYWOOD WBP 12x1220x2500	3.6600	WCP00148	CORE PLYWOOD WBP 10x1220x2500	3.05	PFIN	100	Active	1	WIPA	m3	1.200000
1874	FGP01011	PLYWOOD WBP 12x1220x2500	3.6600	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.037000
1875	FGP01012	FG PLYWOOD WBP 15x1220x2500	4.5750	FGP00690	PLYWOOD WBP 15x1220x2500	4.575	FGOD	100	Active	0	PFIN	m3	1.000000
1876	FGP01013	FG PLYWOOD WBP 18x1220x2500	5.4900	FGP01014	PLYWOOD WBP 18x1220x2500	5.49	FGOD	100	Active	0	PFIN	m3	1.000000
1877	FGP01014	PLYWOOD WBP 18x1220x2500	5.4900	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	9.000000
1878	FGP01014	PLYWOOD WBP 18x1220x2500	5.4900	WCP00150	CORE PLYWOOD WBP 16x1220x2500	4.88	PFIN	100	Active	1	WIPA	m3	1.125000
1879	FGP01014	PLYWOOD WBP 18x1220x2500	5.4900	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.055500
1880	FGP01015	FG PLYWOOD WBP 30x1220x2500	9.1500	FGP01017	PLYWOOD WBP 30x1220x2500	9.15	FGOD	100	Active	0	PFIN	m3	1.000000
1881	FGP01016	PLYWOOD WBP 25x1220x2500	7.6250	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	12.500000
1882	FGP01016	PLYWOOD WBP 25x1220x2500	7.6250	WCP00151	CORE PLYWOOD WBP 23x1220x2500	7.015	PFIN	100	Active	1	WIPA	m3	1.087000
1883	FGP01016	PLYWOOD WBP 25x1220x2500	7.6250	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.077000
1884	FGP01017	PLYWOOD WBP 30x1220x2500	9.1500	WIV00527	VENEER LG 1x1220x2500	0.61	PFIN	100	Active	0	GKOP	m3	15.000000
1885	FGP01017	PLYWOOD WBP 30x1220x2500	9.1500	WCP00152	CORE PLYWOOD WBP 28x1220x2500	1	PFIN	100	Active	1	WIPA	m3	9.150000
1886	FGP01017	PLYWOOD WBP 30x1220x2500	9.1500	SUP00075	PREMIX BONDTITE	99	PFIN	100	Active	2	GKOP	Kg	0.092400
1887	FGP01018	FG PLYWOOD WBP 25x1220x2500	7.6250	FGP01016	PLYWOOD WBP 25x1220x2500	7.625	FGOD	100	Active	0	PFIN	m3	1.000000
1888	FGP01019	ALBASIA FALCATA PLYWOOD MULTIPLEX WBP  19.1x1245x2464	5.8593	FGP00965	FG PLYWOOD WBP 19.1x1245x2464	5.8593	GPAK	100	Active	0	FGOD	m3	1.000000
1889	FGP01019	ALBASIA FALCATA PLYWOOD MULTIPLEX WBP  19.1x1245x2464	5.8593	PAK00112	PACKING TUMPUK 41	100	GPAK	100	Active	1	SUPP	Set	0.058600
1890	PAK00073	PACKING TUMPUK 280	100.0000	PAK00006	KARTON, BC 4.0	1.4286	SUPP	0	Active	0	SUPP	kg	69.998600
1891	PAK00073	PACKING TUMPUK 280	100.0000	PAK00002	LAKBAN, BC 4.0	4.2857	SUPP	0	Active	1	SUPP	mtr	23.333400
1892	PAK00073	PACKING TUMPUK 280	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.1786	SUPP	0	Active	2	SUPP	kg	559.910400
1893	PAK00073	PACKING TUMPUK 280	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.125	SUPP	0	Active	3	SUPP	kg	800.000000
1894	PAK00073	PACKING TUMPUK 280	100.0000	PAK00007	STRAPPING BAND, BC 4.0	9.4643	SUPP	0	Active	4	SUPP	mtr	10.566000
1895	PAK00073	PACKING TUMPUK 280	100.0000	PAK00071	PAKU 1 3/4"	0.25	SUPP	0	Active	5	SUPP	kg	400.000000
1896	PAK00073	PACKING TUMPUK 280	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0047	SUPP	0	Active	6	WADA	m3	21276.595700
1897	PAK00073	PACKING TUMPUK 280	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.003	SUPP	0	Active	7	WADA	m3	33333.333300
1898	PAK00073	PACKING TUMPUK 280	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0012	SUPP	0	Active	8	WADA	m3	83333.333300
1899	PAK00073	PACKING TUMPUK 280	100.0000	PAK00008	GRIPPER, BC 4.0	1.4286	SUPP	0	Active	9	SUPP	pcs	69.998600
1900	PAK00074	PACKING TUMPUK 210	100.0000	PAK00006	KARTON, BC 4.0	1.9048	SUPP	0	Active	0	SUPP	kg	52.499000
1901	PAK00074	PACKING TUMPUK 210	100.0000	PAK00002	LAKBAN, BC 4.0	5.7143	SUPP	0	Active	1	SUPP	mtr	17.500000
1902	PAK00074	PACKING TUMPUK 210	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.2381	SUPP	0	Active	2	SUPP	kg	419.991600
1903	PAK00074	PACKING TUMPUK 210	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.1667	SUPP	0	Active	3	SUPP	kg	599.880000
1904	PAK00074	PACKING TUMPUK 210	100.0000	PAK00007	STRAPPING BAND, BC 4.0	12.619	SUPP	0	Active	4	SUPP	mtr	7.924600
1905	PAK00074	PACKING TUMPUK 210	100.0000	PAK00071	PAKU 1 3/4"	0.3333	SUPP	0	Active	5	SUPP	kg	300.030000
1906	PAK00074	PACKING TUMPUK 210	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0063	SUPP	0	Active	6	WADA	m3	15873.015900
1907	PAK00074	PACKING TUMPUK 210	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.004	SUPP	0	Active	7	WADA	m3	25000.000000
1908	PAK00074	PACKING TUMPUK 210	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0016	SUPP	0	Active	8	WADA	m3	62500.000000
1909	PAK00074	PACKING TUMPUK 210	100.0000	PAK00008	GRIPPER, BC 4.0	1.9048	SUPP	0	Active	9	SUPP	pcs	52.499000
1910	PAK00075	PACKING TUMPUK 150	100.0000	PAK00006	KARTON, BC 4.0	2.6667	SUPP	0	Active	0	SUPP	kg	37.499500
1911	PAK00075	PACKING TUMPUK 150	100.0000	PAK00002	LAKBAN, BC 4.0	8	SUPP	0	Active	1	SUPP	mtr	12.500000
1912	PAK00075	PACKING TUMPUK 150	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.3333	SUPP	0	Active	2	SUPP	kg	300.030000
1913	PAK00075	PACKING TUMPUK 150	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.2333	SUPP	0	Active	3	SUPP	kg	428.632700
1914	PAK00075	PACKING TUMPUK 150	100.0000	PAK00007	STRAPPING BAND, BC 4.0	17.6667	SUPP	0	Active	4	SUPP	mtr	5.660400
1915	PAK00075	PACKING TUMPUK 150	100.0000	PAK00071	PAKU 1 3/4"	0.4667	SUPP	0	Active	5	SUPP	kg	214.270400
1916	PAK00075	PACKING TUMPUK 150	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0088	SUPP	0	Active	6	WADA	m3	11363.636400
1917	PAK00075	PACKING TUMPUK 150	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0056	SUPP	0	Active	7	WADA	m3	17857.142900
1918	PAK00075	PACKING TUMPUK 150	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0023	SUPP	0	Active	8	WADA	m3	43478.260900
1919	PAK00075	PACKING TUMPUK 150	100.0000	PAK00008	GRIPPER, BC 4.0	2.6667	SUPP	0	Active	9	SUPP	pcs	37.499500
1920	PAK00076	PACKING TUMPUK 100	100.0000	PAK00006	KARTON, BC 4.0	4	SUPP	0	Active	0	SUPP	kg	25.000000
1921	PAK00076	PACKING TUMPUK 100	100.0000	PAK00002	LAKBAN, BC 4.0	12	SUPP	0	Active	1	SUPP	mtr	8.333300
1922	PAK00076	PACKING TUMPUK 100	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.5	SUPP	0	Active	2	SUPP	kg	200.000000
1923	PAK00076	PACKING TUMPUK 100	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.35	SUPP	0	Active	3	SUPP	kg	285.714300
1924	PAK00076	PACKING TUMPUK 100	100.0000	PAK00007	STRAPPING BAND, BC 4.0	26.5	SUPP	0	Active	4	SUPP	mtr	3.773600
1925	PAK00076	PACKING TUMPUK 100	100.0000	PAK00071	PAKU 1 3/4"	0.7	SUPP	0	Active	5	SUPP	kg	142.857100
1926	PAK00076	PACKING TUMPUK 100	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0132	SUPP	0	Active	6	WADA	m3	7575.757600
1927	PAK00076	PACKING TUMPUK 100	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0085	SUPP	0	Active	7	WADA	m3	11764.705900
1928	PAK00076	PACKING TUMPUK 100	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0034	SUPP	0	Active	8	WADA	m3	29411.764700
1929	PAK00076	PACKING TUMPUK 100	100.0000	PAK00008	GRIPPER, BC 4.0	4	SUPP	0	Active	9	SUPP	pcs	25.000000
1930	PAK00077	PACKING TUMPUK 80	100.0000	PAK00006	KARTON, BC 4.0	5	SUPP	0	Active	0	SUPP	kg	20.000000
1931	PAK00077	PACKING TUMPUK 80	100.0000	PAK00002	LAKBAN, BC 4.0	15	SUPP	0	Active	1	SUPP	mtr	6.666700
1932	PAK00077	PACKING TUMPUK 80	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.625	SUPP	0	Active	2	SUPP	kg	160.000000
1933	PAK00077	PACKING TUMPUK 80	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.4375	SUPP	0	Active	3	SUPP	kg	228.571400
1934	PAK00077	PACKING TUMPUK 80	100.0000	PAK00007	STRAPPING BAND, BC 4.0	33.125	SUPP	0	Active	4	SUPP	mtr	3.018900
1935	PAK00077	PACKING TUMPUK 80	100.0000	PAK00071	PAKU 1 3/4"	0.875	SUPP	0	Active	5	SUPP	kg	114.285700
1936	PAK00077	PACKING TUMPUK 80	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0165	SUPP	0	Active	6	WADA	m3	6060.606100
1937	PAK00077	PACKING TUMPUK 80	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0106	SUPP	0	Active	7	WADA	m3	9433.962300
1938	PAK00077	PACKING TUMPUK 80	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0042	SUPP	0	Active	8	WADA	m3	23809.523800
1939	PAK00077	PACKING TUMPUK 80	100.0000	PAK00008	GRIPPER, BC 4.0	5	SUPP	0	Active	9	SUPP	pcs	20.000000
1940	PAK00078	PACKING TUMPUK T.15/50	100.0000	PAK00006	KARTON, BC 4.0	8	SUPP	0	Active	0	SUPP	kg	12.500000
1941	PAK00078	PACKING TUMPUK T.15/50	100.0000	PAK00002	LAKBAN, BC 4.0	24	SUPP	0	Active	1	SUPP	mtr	4.166700
1942	PAK00078	PACKING TUMPUK T.15/50	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1	SUPP	0	Active	2	SUPP	kg	100.000000
1943	PAK00078	PACKING TUMPUK T.15/50	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.7	SUPP	0	Active	3	SUPP	kg	142.857100
1944	PAK00078	PACKING TUMPUK T.15/50	100.0000	PAK00007	STRAPPING BAND, BC 4.0	53	SUPP	0	Active	4	SUPP	mtr	1.886800
1945	PAK00078	PACKING TUMPUK T.15/50	100.0000	PAK00071	PAKU 1 3/4"	1.4	SUPP	0	Active	5	SUPP	kg	71.428600
1946	PAK00078	PACKING TUMPUK T.15/50	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0263	SUPP	0	Active	6	WADA	m3	3802.281400
1947	PAK00078	PACKING TUMPUK T.15/50	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0169	SUPP	0	Active	7	WADA	m3	5917.159800
1948	PAK00078	PACKING TUMPUK T.15/50	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0068	SUPP	0	Active	8	WADA	m3	14705.882400
1949	PAK00078	PACKING TUMPUK T.15/50	100.0000	PAK00008	GRIPPER, BC 4.0	8	SUPP	0	Active	9	SUPP	pcs	12.500000
1950	PAK00079	PACKING TUMPUK T.18/50	100.0000	PAK00006	KARTON, BC 4.0	8	SUPP	0	Active	0	SUPP	kg	12.500000
1951	PAK00079	PACKING TUMPUK T.18/50	100.0000	PAK00002	LAKBAN, BC 4.0	24	SUPP	0	Active	1	SUPP	mtr	4.166700
1952	PAK00079	PACKING TUMPUK T.18/50	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1	SUPP	0	Active	2	SUPP	kg	100.000000
1953	PAK00079	PACKING TUMPUK T.18/50	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.7	SUPP	0	Active	3	SUPP	kg	142.857100
1954	PAK00079	PACKING TUMPUK T.18/50	100.0000	PAK00007	STRAPPING BAND, BC 4.0	53	SUPP	0	Active	4	SUPP	mtr	1.886800
1955	PAK00079	PACKING TUMPUK T.18/50	100.0000	PAK00071	PAKU 1 3/4"	1.4	SUPP	0	Active	5	SUPP	kg	71.428600
1956	PAK00079	PACKING TUMPUK T.18/50	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0263	SUPP	0	Active	6	WADA	m3	3802.281400
1957	PAK00079	PACKING TUMPUK T.18/50	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0169	SUPP	0	Active	7	WADA	m3	5917.159800
1958	PAK00079	PACKING TUMPUK T.18/50	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0068	SUPP	0	Active	8	WADA	m3	14705.882400
1959	PAK00079	PACKING TUMPUK T.18/50	100.0000	PAK00008	GRIPPER, BC 4.0	8	SUPP	0	Active	9	SUPP	pcs	12.500000
1960	PAK00080	PACKING TUMPUK 42	100.0000	PAK00006	KARTON, BC 4.0	9.5238	SUPP	0	Active	0	SUPP	kg	10.500000
1961	PAK00080	PACKING TUMPUK 42	100.0000	PAK00002	LAKBAN, BC 4.0	28.5714	SUPP	0	Active	1	SUPP	mtr	3.500000
1962	PAK00080	PACKING TUMPUK 42	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.1905	SUPP	0	Active	2	SUPP	kg	83.998300
1963	PAK00080	PACKING TUMPUK 42	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.8333	SUPP	0	Active	3	SUPP	kg	120.004800
1964	PAK00080	PACKING TUMPUK 42	100.0000	PAK00007	STRAPPING BAND, BC 4.0	63.0952	SUPP	0	Active	4	SUPP	mtr	1.584900
1965	PAK00080	PACKING TUMPUK 42	100.0000	PAK00071	PAKU 1 3/4"	1.6667	SUPP	0	Active	5	SUPP	kg	59.998800
1966	PAK00080	PACKING TUMPUK 42	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0313	SUPP	0	Active	6	WADA	m3	3194.888200
1967	PAK00080	PACKING TUMPUK 42	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0201	SUPP	0	Active	7	WADA	m3	4975.124400
1968	PAK00080	PACKING TUMPUK 42	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.008	SUPP	0	Active	8	WADA	m3	12500.000000
1969	PAK00080	PACKING TUMPUK 42	100.0000	PAK00008	GRIPPER, BC 4.0	9.5238	SUPP	0	Active	9	SUPP	pcs	10.500000
1970	PAK00081	PACKING TUMPUK 34 LOKAL	100.0000	PAK00006	KARTON, BC 4.0	11.7647	SUPP	0	Active	0	SUPP	kg	8.500000
1971	PAK00081	PACKING TUMPUK 34 LOKAL	100.0000	PAK00002	LAKBAN, BC 4.0	35.2941	SUPP	0	Active	1	SUPP	mtr	2.833300
1972	PAK00081	PACKING TUMPUK 34 LOKAL	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.4706	SUPP	0	Active	2	SUPP	kg	67.999500
1973	PAK00081	PACKING TUMPUK 34 LOKAL	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	1.0294	SUPP	0	Active	3	SUPP	kg	97.144000
1974	PAK00081	PACKING TUMPUK 34 LOKAL	100.0000	PAK00007	STRAPPING BAND, BC 4.0	77.9412	SUPP	0	Active	4	SUPP	mtr	1.283000
1975	PAK00081	PACKING TUMPUK 34 LOKAL	100.0000	PAK00071	PAKU 1 3/4"	2.0588	SUPP	0	Active	5	SUPP	kg	48.572000
1976	PAK00081	PACKING TUMPUK 34 LOKAL	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0387	SUPP	0	Active	6	WADA	m3	2583.979300
1977	PAK00081	PACKING TUMPUK 34 LOKAL	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0249	SUPP	0	Active	7	WADA	m3	4016.064300
1978	PAK00081	PACKING TUMPUK 34 LOKAL	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0099	SUPP	0	Active	8	WADA	m3	10101.010100
1979	PAK00081	PACKING TUMPUK 34 LOKAL	100.0000	PAK00008	GRIPPER, BC 4.0	11.7647	SUPP	0	Active	9	SUPP	pcs	8.500000
1980	PAK00082	PACKING TUMPUK 25	100.0000	PAK00006	KARTON, BC 4.0	16	SUPP	0	Active	0	SUPP	kg	6.250000
1981	PAK00082	PACKING TUMPUK 25	100.0000	PAK00002	LAKBAN, BC 4.0	48	SUPP	0	Active	1	SUPP	mtr	2.083300
1982	PAK00082	PACKING TUMPUK 25	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	2	SUPP	0	Active	2	SUPP	kg	50.000000
1983	PAK00082	PACKING TUMPUK 25	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	1.4	SUPP	0	Active	3	SUPP	kg	71.428600
1984	PAK00082	PACKING TUMPUK 25	100.0000	PAK00007	STRAPPING BAND, BC 4.0	106	SUPP	0	Active	4	SUPP	mtr	0.943400
1985	PAK00082	PACKING TUMPUK 25	100.0000	PAK00071	PAKU 1 3/4"	2.8	SUPP	0	Active	5	SUPP	kg	35.714300
1986	PAK00082	PACKING TUMPUK 25	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0527	SUPP	0	Active	6	WADA	m3	1897.533200
1987	PAK00082	PACKING TUMPUK 25	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0338	SUPP	0	Active	7	WADA	m3	2958.579900
1988	PAK00082	PACKING TUMPUK 25	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0135	SUPP	0	Active	8	WADA	m3	7407.407400
1989	PAK00082	PACKING TUMPUK 25	100.0000	PAK00008	GRIPPER, BC 4.0	16	SUPP	0	Active	9	SUPP	pcs	6.250000
1990	PAK00083	PACKING TUMPUK 31	100.0000	PAK00006	KARTON, BC 4.0	12.9032	SUPP	0	Active	0	SUPP	kg	7.750000
1991	PAK00083	PACKING TUMPUK 31	100.0000	PAK00002	LAKBAN, BC 4.0	38.7097	SUPP	0	Active	1	SUPP	mtr	2.583300
1992	PAK00083	PACKING TUMPUK 31	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.6129	SUPP	0	Active	2	SUPP	kg	62.000100
1993	PAK00083	PACKING TUMPUK 31	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	1.129	SUPP	0	Active	3	SUPP	kg	88.574000
1994	PAK00083	PACKING TUMPUK 31	100.0000	PAK00007	STRAPPING BAND, BC 4.0	85.4839	SUPP	0	Active	4	SUPP	mtr	1.169800
1995	PAK00083	PACKING TUMPUK 31	100.0000	PAK00071	PAKU 1 3/4"	2.2581	SUPP	0	Active	5	SUPP	kg	44.285000
1996	PAK00083	PACKING TUMPUK 31	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0425	SUPP	0	Active	6	WADA	m3	2352.941200
1997	PAK00083	PACKING TUMPUK 31	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0273	SUPP	0	Active	7	WADA	m3	3663.003700
1998	PAK00083	PACKING TUMPUK 31	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0109	SUPP	0	Active	8	WADA	m3	9174.311900
1999	PAK00083	PACKING TUMPUK 31	100.0000	PAK00008	GRIPPER, BC 4.0	12.9032	SUPP	0	Active	9	SUPP	pcs	7.750000
2000	PAK00084	PACKING TUMPUK 29	100.0000	PAK00006	KARTON, BC 4.0	13.7931	SUPP	0	Active	0	SUPP	kg	7.250000
2001	PAK00084	PACKING TUMPUK 29	100.0000	PAK00002	LAKBAN, BC 4.0	41.3793	SUPP	0	Active	1	SUPP	mtr	2.416700
2002	PAK00084	PACKING TUMPUK 29	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.7241	SUPP	0	Active	2	SUPP	kg	58.001300
2003	PAK00084	PACKING TUMPUK 29	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	1.2069	SUPP	0	Active	3	SUPP	kg	82.856900
2004	PAK00084	PACKING TUMPUK 29	100.0000	PAK00007	STRAPPING BAND, BC 4.0	91.3793	SUPP	0	Active	4	SUPP	mtr	1.094300
2005	PAK00084	PACKING TUMPUK 29	100.0000	PAK00071	PAKU 1 3/4"	2.4138	SUPP	0	Active	5	SUPP	kg	41.428500
2006	PAK00084	PACKING TUMPUK 29	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0454	SUPP	0	Active	6	WADA	m3	2202.643200
2007	PAK00084	PACKING TUMPUK 29	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0291	SUPP	0	Active	7	WADA	m3	3436.426100
2008	PAK00084	PACKING TUMPUK 29	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0117	SUPP	0	Active	8	WADA	m3	8547.008500
2009	PAK00084	PACKING TUMPUK 29	100.0000	PAK00008	GRIPPER, BC 4.0	13.7931	SUPP	0	Active	9	SUPP	pcs	7.250000
2010	PAK00085	PACKING TUMPUK P.2500/210	100.0000	PAK00006	KARTON, BC 4.0	1.9048	SUPP	0	Active	0	SUPP	kg	52.499000
2011	PAK00085	PACKING TUMPUK P.2500/210	100.0000	PAK00002	LAKBAN, BC 4.0	5.7143	SUPP	0	Active	1	SUPP	mtr	17.500000
2012	PAK00085	PACKING TUMPUK P.2500/210	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.2381	SUPP	0	Active	2	SUPP	kg	419.991600
2013	PAK00085	PACKING TUMPUK P.2500/210	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.1667	SUPP	0	Active	3	SUPP	kg	599.880000
2014	PAK00085	PACKING TUMPUK P.2500/210	100.0000	PAK00007	STRAPPING BAND, BC 4.0	12.619	SUPP	0	Active	4	SUPP	mtr	7.924600
2015	PAK00085	PACKING TUMPUK P.2500/210	100.0000	PAK00071	PAKU 1 3/4"	0.3333	SUPP	0	Active	5	SUPP	kg	300.030000
2016	PAK00085	PACKING TUMPUK P.2500/210	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0063	SUPP	0	Active	6	WADA	m3	15873.015900
2017	PAK00085	PACKING TUMPUK P.2500/210	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.004	SUPP	0	Active	7	WADA	m3	25000.000000
2018	PAK00085	PACKING TUMPUK P.2500/210	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0016	SUPP	0	Active	8	WADA	m3	62500.000000
2019	PAK00085	PACKING TUMPUK P.2500/210	100.0000	PAK00008	GRIPPER, BC 4.0	1.9048	SUPP	0	Active	9	SUPP	pcs	52.499000
2020	PAK00086	PACKING TUMPUK SEPATU 210	100.0000	PAK00006	KARTON, BC 4.0	1.9048	SUPP	0	Active	0	SUPP	kg	52.499000
2021	PAK00086	PACKING TUMPUK SEPATU 210	100.0000	PAK00002	LAKBAN, BC 4.0	5.7143	SUPP	0	Active	1	SUPP	mtr	17.500000
2022	PAK00086	PACKING TUMPUK SEPATU 210	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.2381	SUPP	0	Active	2	SUPP	kg	419.991600
2023	PAK00086	PACKING TUMPUK SEPATU 210	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.1667	SUPP	0	Active	3	SUPP	kg	599.880000
2024	PAK00086	PACKING TUMPUK SEPATU 210	100.0000	PAK00007	STRAPPING BAND, BC 4.0	12.619	SUPP	0	Active	4	SUPP	mtr	7.924600
2025	PAK00086	PACKING TUMPUK SEPATU 210	100.0000	PAK00071	PAKU 1 3/4"	0.9333	SUPP	0	Active	5	SUPP	kg	107.146700
2026	PAK00086	PACKING TUMPUK SEPATU 210	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0075	SUPP	0	Active	6	WADA	m3	13333.333300
2027	PAK00086	PACKING TUMPUK SEPATU 210	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0032	SUPP	0	Active	7	WADA	m3	31250.000000
2028	PAK00086	PACKING TUMPUK SEPATU 210	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.008	SUPP	0	Active	8	WADA	m3	12500.000000
2029	PAK00086	PACKING TUMPUK SEPATU 210	100.0000	PAK00008	GRIPPER, BC 4.0	1.9048	SUPP	0	Active	9	SUPP	pcs	52.499000
2030	PAK00087	PACKING BERDIRI 210	100.0000	PAK00006	KARTON, BC 4.0	1.9048	SUPP	0	Active	0	SUPP	kg	52.499000
2031	PAK00087	PACKING BERDIRI 210	100.0000	PAK00002	LAKBAN, BC 4.0	5.7143	SUPP	0	Active	1	SUPP	mtr	17.500000
2032	PAK00087	PACKING BERDIRI 210	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.2381	SUPP	0	Active	2	SUPP	kg	419.991600
2033	PAK00087	PACKING BERDIRI 210	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.3333	SUPP	0	Active	3	SUPP	kg	300.030000
2034	PAK00087	PACKING BERDIRI 210	100.0000	PAK00007	STRAPPING BAND, BC 4.0	27.4762	SUPP	0	Active	4	SUPP	mtr	3.639500
2035	PAK00087	PACKING BERDIRI 210	100.0000	PAK00071	PAKU 1 3/4"	1.1048	SUPP	0	Active	5	SUPP	kg	90.514100
2036	PAK00087	PACKING BERDIRI 210	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0113	SUPP	0	Active	6	WADA	m3	8849.557500
2037	PAK00087	PACKING BERDIRI 210	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.004	SUPP	0	Active	7	WADA	m3	25000.000000
2038	PAK00087	PACKING BERDIRI 210	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0101	SUPP	0	Active	8	WADA	m3	9900.990100
2039	PAK00087	PACKING BERDIRI 210	100.0000	PAK00008	GRIPPER, BC 4.0	7.1429	SUPP	0	Active	9	SUPP	pcs	13.999900
2040	PAK00088	PACKING TUMPUK 180	100.0000	PAK00006	KARTON, BC 4.0	2.2222	SUPP	0	Active	0	SUPP	kg	45.000500
2041	PAK00088	PACKING TUMPUK 180	100.0000	PAK00002	LAKBAN, BC 4.0	6.6667	SUPP	0	Active	1	SUPP	mtr	14.999900
2042	PAK00088	PACKING TUMPUK 180	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.2778	SUPP	0	Active	2	SUPP	kg	359.971200
2043	PAK00088	PACKING TUMPUK 180	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.1944	SUPP	0	Active	3	SUPP	kg	514.403300
2044	PAK00088	PACKING TUMPUK 180	100.0000	PAK00007	STRAPPING BAND, BC 4.0	14.7222	SUPP	0	Active	4	SUPP	mtr	6.792500
2045	PAK00088	PACKING TUMPUK 180	100.0000	PAK00071	PAKU 1 3/4"	0.3889	SUPP	0	Active	5	SUPP	kg	257.135500
2046	PAK00088	PACKING TUMPUK 180	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0073	SUPP	0	Active	6	WADA	m3	13698.630100
2047	PAK00088	PACKING TUMPUK 180	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0047	SUPP	0	Active	7	WADA	m3	21276.595700
2048	PAK00088	PACKING TUMPUK 180	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0019	SUPP	0	Active	8	WADA	m3	52631.578900
2049	PAK00088	PACKING TUMPUK 180	100.0000	PAK00008	GRIPPER, BC 4.0	2.2222	SUPP	0	Active	9	SUPP	pcs	45.000500
2050	PAK00089	PACKING TUMPUK SEPATU 180	100.0000	PAK00006	KARTON, BC 4.0	2.2222	SUPP	0	Active	0	SUPP	kg	45.000500
2051	PAK00089	PACKING TUMPUK SEPATU 180	100.0000	PAK00002	LAKBAN, BC 4.0	6.6667	SUPP	0	Active	1	SUPP	mtr	14.999900
2052	PAK00089	PACKING TUMPUK SEPATU 180	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.2778	SUPP	0	Active	2	SUPP	kg	359.971200
2053	PAK00089	PACKING TUMPUK SEPATU 180	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.1944	SUPP	0	Active	3	SUPP	kg	514.403300
2054	PAK00089	PACKING TUMPUK SEPATU 180	100.0000	PAK00007	STRAPPING BAND, BC 4.0	14.7222	SUPP	0	Active	4	SUPP	mtr	6.792500
2055	PAK00089	PACKING TUMPUK SEPATU 180	100.0000	PAK00071	PAKU 1 3/4"	1.0889	SUPP	0	Active	5	SUPP	kg	91.835800
2056	PAK00089	PACKING TUMPUK SEPATU 180	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0088	SUPP	0	Active	6	WADA	m3	11363.636400
2057	PAK00089	PACKING TUMPUK SEPATU 180	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0038	SUPP	0	Active	7	WADA	m3	26315.789500
2058	PAK00089	PACKING TUMPUK SEPATU 180	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0094	SUPP	0	Active	8	WADA	m3	10638.297900
2059	PAK00089	PACKING TUMPUK SEPATU 180	100.0000	PAK00008	GRIPPER, BC 4.0	2.2222	SUPP	0	Active	9	SUPP	pcs	45.000500
2060	PAK00090	PACKING BERDIRI 180	100.0000	PAK00006	KARTON, BC 4.0	2.2222	SUPP	0	Active	0	SUPP	kg	45.000500
2061	PAK00090	PACKING BERDIRI 180	100.0000	PAK00002	LAKBAN, BC 4.0	6.6667	SUPP	0	Active	1	SUPP	mtr	14.999900
2062	PAK00090	PACKING BERDIRI 180	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.2778	SUPP	0	Active	2	SUPP	kg	359.971200
2063	PAK00090	PACKING BERDIRI 180	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.3889	SUPP	0	Active	3	SUPP	kg	257.135500
2064	PAK00090	PACKING BERDIRI 180	100.0000	PAK00007	STRAPPING BAND, BC 4.0	32.0556	SUPP	0	Active	4	SUPP	mtr	3.119600
2065	PAK00090	PACKING BERDIRI 180	100.0000	PAK00071	PAKU 1 3/4"	1.2889	SUPP	0	Active	5	SUPP	kg	77.585500
2066	PAK00090	PACKING BERDIRI 180	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0132	SUPP	0	Active	6	WADA	m3	7575.757600
2067	PAK00090	PACKING BERDIRI 180	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0047	SUPP	0	Active	7	WADA	m3	21276.595700
2068	PAK00090	PACKING BERDIRI 180	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0117	SUPP	0	Active	8	WADA	m3	8547.008500
2069	PAK00090	PACKING BERDIRI 180	100.0000	PAK00008	GRIPPER, BC 4.0	8.3333	SUPP	0	Active	9	SUPP	pcs	12.000000
2070	PAK00091	PACKING TUMPUK 144	100.0000	PAK00006	KARTON, BC 4.0	2.7778	SUPP	0	Active	0	SUPP	kg	35.999700
2071	PAK00091	PACKING TUMPUK 144	100.0000	PAK00002	LAKBAN, BC 4.0	8.3333	SUPP	0	Active	1	SUPP	mtr	12.000000
2072	PAK00091	PACKING TUMPUK 144	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.3472	SUPP	0	Active	2	SUPP	kg	288.018400
2073	PAK00091	PACKING TUMPUK 144	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.2431	SUPP	0	Active	3	SUPP	kg	411.353400
2074	PAK00091	PACKING TUMPUK 144	100.0000	PAK00007	STRAPPING BAND, BC 4.0	18.4028	SUPP	0	Active	4	SUPP	mtr	5.434000
2075	PAK00091	PACKING TUMPUK 144	100.0000	PAK00071	PAKU 1 3/4"	0.4861	SUPP	0	Active	5	SUPP	kg	205.719000
2076	PAK00091	PACKING TUMPUK 144	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0091	SUPP	0	Active	6	WADA	m3	10989.011000
2077	PAK00091	PACKING TUMPUK 144	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0059	SUPP	0	Active	7	WADA	m3	16949.152500
2078	PAK00091	PACKING TUMPUK 144	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0023	SUPP	0	Active	8	WADA	m3	43478.260900
2079	PAK00091	PACKING TUMPUK 144	100.0000	PAK00008	GRIPPER, BC 4.0	2.7778	SUPP	0	Active	9	SUPP	pcs	35.999700
2080	PAK00092	PACKING TUMPUK SEPATU 144	100.0000	PAK00006	KARTON, BC 4.0	2.7778	SUPP	0	Active	0	SUPP	kg	35.999700
2081	PAK00092	PACKING TUMPUK SEPATU 144	100.0000	PAK00002	LAKBAN, BC 4.0	8.3333	SUPP	0	Active	1	SUPP	mtr	12.000000
2082	PAK00092	PACKING TUMPUK SEPATU 144	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.3472	SUPP	0	Active	2	SUPP	kg	288.018400
2083	PAK00092	PACKING TUMPUK SEPATU 144	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.2431	SUPP	0	Active	3	SUPP	kg	411.353400
2084	PAK00092	PACKING TUMPUK SEPATU 144	100.0000	PAK00007	STRAPPING BAND, BC 4.0	18.4028	SUPP	0	Active	4	SUPP	mtr	5.434000
2085	PAK00092	PACKING TUMPUK SEPATU 144	100.0000	PAK00071	PAKU 1 3/4"	1.3611	SUPP	0	Active	5	SUPP	kg	73.470000
2086	PAK00092	PACKING TUMPUK SEPATU 144	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.011	SUPP	0	Active	6	WADA	m3	9090.909100
2087	PAK00092	PACKING TUMPUK SEPATU 144	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0047	SUPP	0	Active	7	WADA	m3	21276.595700
2088	PAK00092	PACKING TUMPUK SEPATU 144	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0117	SUPP	0	Active	8	WADA	m3	8547.008500
2089	PAK00092	PACKING TUMPUK SEPATU 144	100.0000	PAK00008	GRIPPER, BC 4.0	2.7778	SUPP	0	Active	9	SUPP	pcs	35.999700
2090	PAK00093	PACKING BERDIRI 144	100.0000	PAK00006	KARTON, BC 4.0	2.7778	SUPP	0	Active	0	SUPP	kg	35.999700
2091	PAK00093	PACKING BERDIRI 144	100.0000	PAK00002	LAKBAN, BC 4.0	8.3333	SUPP	0	Active	1	SUPP	mtr	12.000000
2092	PAK00093	PACKING BERDIRI 144	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.3472	SUPP	0	Active	2	SUPP	kg	288.018400
2093	PAK00093	PACKING BERDIRI 144	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.4861	SUPP	0	Active	3	SUPP	kg	205.719000
2094	PAK00093	PACKING BERDIRI 144	100.0000	PAK00007	STRAPPING BAND, BC 4.0	40.0694	SUPP	0	Active	4	SUPP	mtr	2.495700
2095	PAK00093	PACKING BERDIRI 144	100.0000	PAK00071	PAKU 1 3/4"	1.6111	SUPP	0	Active	5	SUPP	kg	62.069400
2096	PAK00093	PACKING BERDIRI 144	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0165	SUPP	0	Active	6	WADA	m3	6060.606100
2097	PAK00093	PACKING BERDIRI 144	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0059	SUPP	0	Active	7	WADA	m3	16949.152500
2098	PAK00093	PACKING BERDIRI 144	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0147	SUPP	0	Active	8	WADA	m3	6802.721100
2099	PAK00093	PACKING BERDIRI 144	100.0000	PAK00008	GRIPPER, BC 4.0	10.4167	SUPP	0	Active	9	SUPP	pcs	9.600000
2100	PAK00094	PACKING TUMPUK 120	100.0000	PAK00006	KARTON, BC 4.0	3.3333	SUPP	0	Active	0	SUPP	kg	30.000300
2101	PAK00094	PACKING TUMPUK 120	100.0000	PAK00002	LAKBAN, BC 4.0	10	SUPP	0	Active	1	SUPP	mtr	10.000000
2102	PAK00094	PACKING TUMPUK 120	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.4167	SUPP	0	Active	2	SUPP	kg	239.980800
2103	PAK00094	PACKING TUMPUK 120	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.2917	SUPP	0	Active	3	SUPP	kg	342.818000
2104	PAK00094	PACKING TUMPUK 120	100.0000	PAK00007	STRAPPING BAND, BC 4.0	22.0833	SUPP	0	Active	4	SUPP	mtr	4.528300
2105	PAK00094	PACKING TUMPUK 120	100.0000	PAK00071	PAKU 1 3/4"	0.5833	SUPP	0	Active	5	SUPP	kg	171.438400
2106	PAK00094	PACKING TUMPUK 120	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.011	SUPP	0	Active	6	WADA	m3	9090.909100
2107	PAK00094	PACKING TUMPUK 120	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.007	SUPP	0	Active	7	WADA	m3	14285.714300
2108	PAK00094	PACKING TUMPUK 120	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0028	SUPP	0	Active	8	WADA	m3	35714.285700
2109	PAK00094	PACKING TUMPUK 120	100.0000	PAK00008	GRIPPER, BC 4.0	3.3333	SUPP	0	Active	9	SUPP	pcs	30.000300
2110	PAK00095	PACKING TUMPUK SEPATU 120	100.0000	PAK00006	KARTON, BC 4.0	3.3333	SUPP	0	Active	0	SUPP	kg	30.000300
2111	PAK00095	PACKING TUMPUK SEPATU 120	100.0000	PAK00002	LAKBAN, BC 4.0	10	SUPP	0	Active	1	SUPP	mtr	10.000000
2112	PAK00095	PACKING TUMPUK SEPATU 120	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.4167	SUPP	0	Active	2	SUPP	kg	239.980800
2113	PAK00095	PACKING TUMPUK SEPATU 120	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.2917	SUPP	0	Active	3	SUPP	kg	342.818000
2114	PAK00095	PACKING TUMPUK SEPATU 120	100.0000	PAK00007	STRAPPING BAND, BC 4.0	22.0833	SUPP	0	Active	4	SUPP	mtr	4.528300
2115	PAK00095	PACKING TUMPUK SEPATU 120	100.0000	PAK00071	PAKU 1 3/4"	1.6333	SUPP	0	Active	5	SUPP	kg	61.225700
2116	PAK00095	PACKING TUMPUK SEPATU 120	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0132	SUPP	0	Active	6	WADA	m3	7575.757600
2117	PAK00095	PACKING TUMPUK SEPATU 120	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0056	SUPP	0	Active	7	WADA	m3	17857.142900
2118	PAK00095	PACKING TUMPUK SEPATU 120	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0141	SUPP	0	Active	8	WADA	m3	7092.198600
2119	PAK00095	PACKING TUMPUK SEPATU 120	100.0000	PAK00008	GRIPPER, BC 4.0	3.3333	SUPP	0	Active	9	SUPP	pcs	30.000300
2120	PAK00096	PACKING BERDIRI P.2500/120	100.0000	PAK00006	KARTON, BC 4.0	3.3333	SUPP	0	Active	0	SUPP	kg	30.000300
2121	PAK00096	PACKING BERDIRI P.2500/120	100.0000	PAK00002	LAKBAN, BC 4.0	10	SUPP	0	Active	1	SUPP	mtr	10.000000
2122	PAK00096	PACKING BERDIRI P.2500/120	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.4167	SUPP	0	Active	2	SUPP	kg	239.980800
2123	PAK00096	PACKING BERDIRI P.2500/120	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.5833	SUPP	0	Active	3	SUPP	kg	171.438400
2124	PAK00096	PACKING BERDIRI P.2500/120	100.0000	PAK00007	STRAPPING BAND, BC 4.0	48.0833	SUPP	0	Active	4	SUPP	mtr	2.079700
2125	PAK00096	PACKING BERDIRI P.2500/120	100.0000	PAK00071	PAKU 1 3/4"	1.9333	SUPP	0	Active	5	SUPP	kg	51.725000
2126	PAK00096	PACKING BERDIRI P.2500/120	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0197	SUPP	0	Active	6	WADA	m3	5076.142100
2127	PAK00096	PACKING BERDIRI P.2500/120	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.007	SUPP	0	Active	7	WADA	m3	14285.714300
2128	PAK00096	PACKING BERDIRI P.2500/120	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0176	SUPP	0	Active	8	WADA	m3	5681.818200
2129	PAK00096	PACKING BERDIRI P.2500/120	100.0000	PAK00008	GRIPPER, BC 4.0	12.5	SUPP	0	Active	9	SUPP	pcs	8.000000
2130	PAK00097	PACKING TUMPUK 90	100.0000	PAK00006	KARTON, BC 4.0	4.4444	SUPP	0	Active	0	SUPP	kg	22.500200
2131	PAK00097	PACKING TUMPUK 90	100.0000	PAK00002	LAKBAN, BC 4.0	13.3333	SUPP	0	Active	1	SUPP	mtr	7.500000
2132	PAK00097	PACKING TUMPUK 90	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.5556	SUPP	0	Active	2	SUPP	kg	179.985600
2133	PAK00097	PACKING TUMPUK 90	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.3889	SUPP	0	Active	3	SUPP	kg	257.135500
2134	PAK00097	PACKING TUMPUK 90	100.0000	PAK00007	STRAPPING BAND, BC 4.0	29.4444	SUPP	0	Active	4	SUPP	mtr	3.396200
2135	PAK00097	PACKING TUMPUK 90	100.0000	PAK00071	PAKU 1 3/4"	0.7778	SUPP	0	Active	5	SUPP	kg	128.567800
2136	PAK00097	PACKING TUMPUK 90	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0146	SUPP	0	Active	6	WADA	m3	6849.315100
2137	PAK00097	PACKING TUMPUK 90	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0094	SUPP	0	Active	7	WADA	m3	10638.297900
2138	PAK00097	PACKING TUMPUK 90	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0038	SUPP	0	Active	8	WADA	m3	26315.789500
2139	PAK00097	PACKING TUMPUK 90	100.0000	PAK00008	GRIPPER, BC 4.0	4.4444	SUPP	0	Active	9	SUPP	pcs	22.500200
2140	PAK00098	PACKING TUMPUK SEPATU 90	100.0000	PAK00006	KARTON, BC 4.0	4.4444	SUPP	0	Active	0	SUPP	kg	22.500200
2141	PAK00098	PACKING TUMPUK SEPATU 90	100.0000	PAK00002	LAKBAN, BC 4.0	13.3333	SUPP	0	Active	1	SUPP	mtr	7.500000
2142	PAK00098	PACKING TUMPUK SEPATU 90	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.5556	SUPP	0	Active	2	SUPP	kg	179.985600
2143	PAK00098	PACKING TUMPUK SEPATU 90	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.3889	SUPP	0	Active	3	SUPP	kg	257.135500
2144	PAK00098	PACKING TUMPUK SEPATU 90	100.0000	PAK00007	STRAPPING BAND, BC 4.0	29.4444	SUPP	0	Active	4	SUPP	mtr	3.396200
2145	PAK00098	PACKING TUMPUK SEPATU 90	100.0000	PAK00071	PAKU 1 3/4"	2.1778	SUPP	0	Active	5	SUPP	kg	45.917900
2146	PAK00098	PACKING TUMPUK SEPATU 90	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0176	SUPP	0	Active	6	WADA	m3	5681.818200
2147	PAK00098	PACKING TUMPUK SEPATU 90	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0075	SUPP	0	Active	7	WADA	m3	13333.333300
2148	PAK00098	PACKING TUMPUK SEPATU 90	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0188	SUPP	0	Active	8	WADA	m3	5319.148900
2149	PAK00098	PACKING TUMPUK SEPATU 90	100.0000	PAK00008	GRIPPER, BC 4.0	4.4444	SUPP	0	Active	9	SUPP	pcs	22.500200
2150	PAK00099	PACKING BERDIRI 90	100.0000	PAK00006	KARTON, BC 4.0	4.4444	SUPP	0	Active	0	SUPP	kg	22.500200
2151	PAK00099	PACKING BERDIRI 90	100.0000	PAK00002	LAKBAN, BC 4.0	13.3333	SUPP	0	Active	1	SUPP	mtr	7.500000
2152	PAK00099	PACKING BERDIRI 90	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.5556	SUPP	0	Active	2	SUPP	kg	179.985600
2153	PAK00099	PACKING BERDIRI 90	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.7778	SUPP	0	Active	3	SUPP	kg	128.567800
2154	PAK00099	PACKING BERDIRI 90	100.0000	PAK00007	STRAPPING BAND, BC 4.0	64.1111	SUPP	0	Active	4	SUPP	mtr	1.559800
2155	PAK00099	PACKING BERDIRI 90	100.0000	PAK00071	PAKU 1 3/4"	2.5778	SUPP	0	Active	5	SUPP	kg	38.792800
2156	PAK00099	PACKING BERDIRI 90	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0263	SUPP	0	Active	6	WADA	m3	3802.281400
2157	PAK00099	PACKING BERDIRI 90	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0094	SUPP	0	Active	7	WADA	m3	10638.297900
2158	PAK00099	PACKING BERDIRI 90	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0235	SUPP	0	Active	8	WADA	m3	4255.319100
2159	PAK00099	PACKING BERDIRI 90	100.0000	PAK00008	GRIPPER, BC 4.0	16.6667	SUPP	0	Active	9	SUPP	pcs	6.000000
2160	PAK00100	PACKING TUMPUK P.2500/80	100.0000	PAK00006	KARTON, BC 4.0	5	SUPP	0	Active	0	SUPP	kg	20.000000
2161	PAK00100	PACKING TUMPUK P.2500/80	100.0000	PAK00002	LAKBAN, BC 4.0	15	SUPP	0	Active	1	SUPP	mtr	6.666700
2162	PAK00100	PACKING TUMPUK P.2500/80	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.625	SUPP	0	Active	2	SUPP	kg	160.000000
2163	PAK00100	PACKING TUMPUK P.2500/80	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.4375	SUPP	0	Active	3	SUPP	kg	228.571400
2164	PAK00100	PACKING TUMPUK P.2500/80	100.0000	PAK00007	STRAPPING BAND, BC 4.0	33.125	SUPP	0	Active	4	SUPP	mtr	3.018900
2165	PAK00100	PACKING TUMPUK P.2500/80	100.0000	PAK00071	PAKU 1 3/4"	0.875	SUPP	0	Active	5	SUPP	kg	114.285700
2166	PAK00100	PACKING TUMPUK P.2500/80	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0165	SUPP	0	Active	6	WADA	m3	6060.606100
2167	PAK00100	PACKING TUMPUK P.2500/80	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0106	SUPP	0	Active	7	WADA	m3	9433.962300
2168	PAK00100	PACKING TUMPUK P.2500/80	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0042	SUPP	0	Active	8	WADA	m3	23809.523800
2169	PAK00100	PACKING TUMPUK P.2500/80	100.0000	PAK00008	GRIPPER, BC 4.0	5	SUPP	0	Active	9	SUPP	pcs	20.000000
2170	PAK00101	PACKING TUMPUK SEPATU 80	100.0000	PAK00006	KARTON, BC 4.0	5	SUPP	0	Active	0	SUPP	kg	20.000000
2171	PAK00101	PACKING TUMPUK SEPATU 80	100.0000	PAK00002	LAKBAN, BC 4.0	15	SUPP	0	Active	1	SUPP	mtr	6.666700
2172	PAK00101	PACKING TUMPUK SEPATU 80	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.625	SUPP	0	Active	2	SUPP	kg	160.000000
2173	PAK00101	PACKING TUMPUK SEPATU 80	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.4375	SUPP	0	Active	3	SUPP	kg	228.571400
2174	PAK00101	PACKING TUMPUK SEPATU 80	100.0000	PAK00007	STRAPPING BAND, BC 4.0	33.125	SUPP	0	Active	4	SUPP	mtr	3.018900
2175	PAK00101	PACKING TUMPUK SEPATU 80	100.0000	PAK00071	PAKU 1 3/4"	2.45	SUPP	0	Active	5	SUPP	kg	40.816300
2176	PAK00101	PACKING TUMPUK SEPATU 80	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0197	SUPP	0	Active	6	WADA	m3	5076.142100
2177	PAK00101	PACKING TUMPUK SEPATU 80	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0085	SUPP	0	Active	7	WADA	m3	11764.705900
2178	PAK00101	PACKING TUMPUK SEPATU 80	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0211	SUPP	0	Active	8	WADA	m3	4739.336500
2179	PAK00101	PACKING TUMPUK SEPATU 80	100.0000	PAK00008	GRIPPER, BC 4.0	5	SUPP	0	Active	9	SUPP	pcs	20.000000
2180	PAK00102	PACKING BERDIRI 80	100.0000	PAK00006	KARTON, BC 4.0	5	SUPP	0	Active	0	SUPP	kg	20.000000
2181	PAK00102	PACKING BERDIRI 80	100.0000	PAK00002	LAKBAN, BC 4.0	15	SUPP	0	Active	1	SUPP	mtr	6.666700
2182	PAK00102	PACKING BERDIRI 80	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.625	SUPP	0	Active	2	SUPP	kg	160.000000
2183	PAK00102	PACKING BERDIRI 80	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.875	SUPP	0	Active	3	SUPP	kg	114.285700
2184	PAK00102	PACKING BERDIRI 80	100.0000	PAK00007	STRAPPING BAND, BC 4.0	72.125	SUPP	0	Active	4	SUPP	mtr	1.386500
2185	PAK00102	PACKING BERDIRI 80	100.0000	PAK00071	PAKU 1 3/4"	2.9	SUPP	0	Active	5	SUPP	kg	34.482800
2186	PAK00102	PACKING BERDIRI 80	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0296	SUPP	0	Active	6	WADA	m3	3378.378400
2187	PAK00102	PACKING BERDIRI 80	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0106	SUPP	0	Active	7	WADA	m3	9433.962300
2188	PAK00102	PACKING BERDIRI 80	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0264	SUPP	0	Active	8	WADA	m3	3787.878800
2189	PAK00102	PACKING BERDIRI 80	100.0000	PAK00008	GRIPPER, BC 4.0	18.75	SUPP	0	Active	9	SUPP	pcs	5.333300
2190	PAK00103	PACKING TUMPUK 73	100.0000	PAK00006	KARTON, BC 4.0	5.4795	SUPP	0	Active	0	SUPP	kg	18.249800
2191	PAK00103	PACKING TUMPUK 73	100.0000	PAK00002	LAKBAN, BC 4.0	16.4384	SUPP	0	Active	1	SUPP	mtr	6.083300
2192	PAK00103	PACKING TUMPUK 73	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.6849	SUPP	0	Active	2	SUPP	kg	146.006700
2193	PAK00103	PACKING TUMPUK 73	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.4795	SUPP	0	Active	3	SUPP	kg	208.550600
2194	PAK00103	PACKING TUMPUK 73	100.0000	PAK00007	STRAPPING BAND, BC 4.0	36.3014	SUPP	0	Active	4	SUPP	mtr	2.754700
2195	PAK00103	PACKING TUMPUK 73	100.0000	PAK00071	PAKU 1 3/4"	0.9589	SUPP	0	Active	5	SUPP	kg	104.286200
2196	PAK00103	PACKING TUMPUK 73	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.018	SUPP	0	Active	6	WADA	m3	5555.555600
2197	PAK00103	PACKING TUMPUK 73	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0116	SUPP	0	Active	7	WADA	m3	8620.689700
2198	PAK00103	PACKING TUMPUK 73	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0046	SUPP	0	Active	8	WADA	m3	21739.130400
2199	PAK00103	PACKING TUMPUK 73	100.0000	PAK00008	GRIPPER, BC 4.0	5.4795	SUPP	0	Active	9	SUPP	pcs	18.249800
2200	PAK00104	PACKING TUMPUK SEPATU 73	100.0000	PAK00006	KARTON, BC 4.0	5.4795	SUPP	0	Active	0	SUPP	kg	18.249800
2201	PAK00104	PACKING TUMPUK SEPATU 73	100.0000	PAK00002	LAKBAN, BC 4.0	16.4384	SUPP	0	Active	1	SUPP	mtr	6.083300
2202	PAK00104	PACKING TUMPUK SEPATU 73	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.6849	SUPP	0	Active	2	SUPP	kg	146.006700
2203	PAK00104	PACKING TUMPUK SEPATU 73	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.4795	SUPP	0	Active	3	SUPP	kg	208.550600
2204	PAK00104	PACKING TUMPUK SEPATU 73	100.0000	PAK00007	STRAPPING BAND, BC 4.0	36.3014	SUPP	0	Active	4	SUPP	mtr	2.754700
2205	PAK00104	PACKING TUMPUK SEPATU 73	100.0000	PAK00071	PAKU 1 3/4"	2.6849	SUPP	0	Active	5	SUPP	kg	37.245300
2206	PAK00104	PACKING TUMPUK SEPATU 73	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0216	SUPP	0	Active	6	WADA	m3	4629.629600
2207	PAK00104	PACKING TUMPUK SEPATU 73	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0093	SUPP	0	Active	7	WADA	m3	10752.688200
2208	PAK00104	PACKING TUMPUK SEPATU 73	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0232	SUPP	0	Active	8	WADA	m3	4310.344800
2209	PAK00104	PACKING TUMPUK SEPATU 73	100.0000	PAK00008	GRIPPER, BC 4.0	5.4795	SUPP	0	Active	9	SUPP	pcs	18.249800
2210	PAK00105	PACKING BERDIRI 73	100.0000	PAK00006	KARTON, BC 4.0	5.4795	SUPP	0	Active	0	SUPP	kg	18.249800
2211	PAK00105	PACKING BERDIRI 73	100.0000	PAK00002	LAKBAN, BC 4.0	16.4384	SUPP	0	Active	1	SUPP	mtr	6.083300
2212	PAK00105	PACKING BERDIRI 73	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.6849	SUPP	0	Active	2	SUPP	kg	146.006700
2213	PAK00105	PACKING BERDIRI 73	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.9589	SUPP	0	Active	3	SUPP	kg	104.286200
2214	PAK00105	PACKING BERDIRI 73	100.0000	PAK00007	STRAPPING BAND, BC 4.0	79.0411	SUPP	0	Active	4	SUPP	mtr	1.265200
2215	PAK00105	PACKING BERDIRI 73	100.0000	PAK00071	PAKU 1 3/4"	3.1781	SUPP	0	Active	5	SUPP	kg	31.465300
2216	PAK00105	PACKING BERDIRI 73	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0325	SUPP	0	Active	6	WADA	m3	3076.923100
2217	PAK00105	PACKING BERDIRI 73	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0116	SUPP	0	Active	7	WADA	m3	8620.689700
2218	PAK00105	PACKING BERDIRI 73	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0289	SUPP	0	Active	8	WADA	m3	3460.207600
2219	PAK00105	PACKING BERDIRI 73	100.0000	PAK00008	GRIPPER, BC 4.0	20.5479	SUPP	0	Active	9	SUPP	pcs	4.866700
2220	PAK00106	PACKING TUMPUK 61	100.0000	PAK00006	KARTON, BC 4.0	6.5574	SUPP	0	Active	0	SUPP	kg	15.249900
2221	PAK00106	PACKING TUMPUK 61	100.0000	PAK00002	LAKBAN, BC 4.0	19.6721	SUPP	0	Active	1	SUPP	mtr	5.083300
2222	PAK00106	PACKING TUMPUK 61	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.8197	SUPP	0	Active	2	SUPP	kg	121.995900
2223	PAK00106	PACKING TUMPUK 61	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.5738	SUPP	0	Active	3	SUPP	kg	174.276800
2224	PAK00106	PACKING TUMPUK 61	100.0000	PAK00007	STRAPPING BAND, BC 4.0	43.4426	SUPP	0	Active	4	SUPP	mtr	2.301900
2225	PAK00106	PACKING TUMPUK 61	100.0000	PAK00071	PAKU 1 3/4"	1.1475	SUPP	0	Active	5	SUPP	kg	87.146000
2226	PAK00106	PACKING TUMPUK 61	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0216	SUPP	0	Active	6	WADA	m3	4629.629600
2227	PAK00106	PACKING TUMPUK 61	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0139	SUPP	0	Active	7	WADA	m3	7194.244600
2228	PAK00106	PACKING TUMPUK 61	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0055	SUPP	0	Active	8	WADA	m3	18181.818200
2229	PAK00106	PACKING TUMPUK 61	100.0000	PAK00008	GRIPPER, BC 4.0	6.5574	SUPP	0	Active	9	SUPP	pcs	15.249900
2230	PAK00107	PACKING TUMPUK SEPATU 61	100.0000	PAK00006	KARTON, BC 4.0	5.4795	SUPP	0	Active	0	SUPP	kg	18.249800
2231	PAK00107	PACKING TUMPUK SEPATU 61	100.0000	PAK00002	LAKBAN, BC 4.0	16.4384	SUPP	0	Active	1	SUPP	mtr	6.083300
2232	PAK00107	PACKING TUMPUK SEPATU 61	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.6849	SUPP	0	Active	2	SUPP	kg	146.006700
2233	PAK00107	PACKING TUMPUK SEPATU 61	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.4795	SUPP	0	Active	3	SUPP	kg	208.550600
2234	PAK00107	PACKING TUMPUK SEPATU 61	100.0000	PAK00007	STRAPPING BAND, BC 4.0	36.3014	SUPP	0	Active	4	SUPP	mtr	2.754700
2235	PAK00107	PACKING TUMPUK SEPATU 61	100.0000	PAK00071	PAKU 1 3/4"	2.6849	SUPP	0	Active	5	SUPP	kg	37.245300
2236	PAK00107	PACKING TUMPUK SEPATU 61	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0216	SUPP	0	Active	6	WADA	m3	4629.629600
2237	PAK00107	PACKING TUMPUK SEPATU 61	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0093	SUPP	0	Active	7	WADA	m3	10752.688200
2238	PAK00107	PACKING TUMPUK SEPATU 61	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0232	SUPP	0	Active	8	WADA	m3	4310.344800
2239	PAK00107	PACKING TUMPUK SEPATU 61	100.0000	PAK00008	GRIPPER, BC 4.0	5.4795	SUPP	0	Active	9	SUPP	pcs	18.249800
2240	PAK00108	PACKING BERDIRI 61	100.0000	PAK00006	KARTON, BC 4.0	2.7778	SUPP	0	Active	0	SUPP	kg	35.999700
2241	PAK00108	PACKING BERDIRI 61	100.0000	PAK00002	LAKBAN, BC 4.0	8.3333	SUPP	0	Active	1	SUPP	mtr	12.000000
2242	PAK00108	PACKING BERDIRI 61	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.3472	SUPP	0	Active	2	SUPP	kg	288.018400
2243	PAK00108	PACKING BERDIRI 61	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.4861	SUPP	0	Active	3	SUPP	kg	205.719000
2244	PAK00108	PACKING BERDIRI 61	100.0000	PAK00007	STRAPPING BAND, BC 4.0	40.0694	SUPP	0	Active	4	SUPP	mtr	2.495700
2245	PAK00108	PACKING BERDIRI 61	100.0000	PAK00071	PAKU 1 3/4"	1.6111	SUPP	0	Active	5	SUPP	kg	62.069400
2246	PAK00108	PACKING BERDIRI 61	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0165	SUPP	0	Active	6	WADA	m3	6060.606100
2247	PAK00108	PACKING BERDIRI 61	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0059	SUPP	0	Active	7	WADA	m3	16949.152500
2248	PAK00108	PACKING BERDIRI 61	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0147	SUPP	0	Active	8	WADA	m3	6802.721100
2249	PAK00108	PACKING BERDIRI 61	100.0000	PAK00008	GRIPPER, BC 4.0	10.4167	SUPP	0	Active	9	SUPP	pcs	9.600000
2250	PAK00109	PACKING TUMPUK 49	100.0000	PAK00006	KARTON, BC 4.0	8.1633	SUPP	0	Active	0	SUPP	kg	12.249900
2251	PAK00109	PACKING TUMPUK 49	100.0000	PAK00002	LAKBAN, BC 4.0	24.4898	SUPP	0	Active	1	SUPP	mtr	4.083300
2252	PAK00109	PACKING TUMPUK 49	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.0204	SUPP	0	Active	2	SUPP	kg	98.000800
2253	PAK00109	PACKING TUMPUK 49	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.7143	SUPP	0	Active	3	SUPP	kg	139.997200
2254	PAK00109	PACKING TUMPUK 49	100.0000	PAK00007	STRAPPING BAND, BC 4.0	54.0816	SUPP	0	Active	4	SUPP	mtr	1.849100
2255	PAK00109	PACKING TUMPUK 49	100.0000	PAK00071	PAKU 1 3/4"	1.4286	SUPP	0	Active	5	SUPP	kg	69.998600
2256	PAK00109	PACKING TUMPUK 49	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0269	SUPP	0	Active	6	WADA	m3	3717.472100
2257	PAK00109	PACKING TUMPUK 49	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0172	SUPP	0	Active	7	WADA	m3	5813.953500
2258	PAK00109	PACKING TUMPUK 49	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0069	SUPP	0	Active	8	WADA	m3	14492.753600
2259	PAK00109	PACKING TUMPUK 49	100.0000	PAK00008	GRIPPER, BC 4.0	8.1633	SUPP	0	Active	9	SUPP	pcs	12.249900
2260	PAK00110	PACKING TUMPUK SEPATU 49	100.0000	PAK00006	KARTON, BC 4.0	8.1633	SUPP	0	Active	0	SUPP	kg	12.249900
2261	PAK00110	PACKING TUMPUK SEPATU 49	100.0000	PAK00002	LAKBAN, BC 4.0	24.4898	SUPP	0	Active	1	SUPP	mtr	4.083300
2262	PAK00110	PACKING TUMPUK SEPATU 49	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.0204	SUPP	0	Active	2	SUPP	kg	98.000800
2263	PAK00110	PACKING TUMPUK SEPATU 49	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.7143	SUPP	0	Active	3	SUPP	kg	139.997200
2264	PAK00110	PACKING TUMPUK SEPATU 49	100.0000	PAK00007	STRAPPING BAND, BC 4.0	54.0816	SUPP	0	Active	4	SUPP	mtr	1.849100
2265	PAK00110	PACKING TUMPUK SEPATU 49	100.0000	PAK00071	PAKU 1 3/4"	4	SUPP	0	Active	5	SUPP	kg	25.000000
2266	PAK00110	PACKING TUMPUK SEPATU 49	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0322	SUPP	0	Active	6	WADA	m3	3105.590100
2267	PAK00110	PACKING TUMPUK SEPATU 49	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0138	SUPP	0	Active	7	WADA	m3	7246.376800
2268	PAK00110	PACKING TUMPUK SEPATU 49	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0345	SUPP	0	Active	8	WADA	m3	2898.550700
2269	PAK00110	PACKING TUMPUK SEPATU 49	100.0000	PAK00008	GRIPPER, BC 4.0	8.1633	SUPP	0	Active	9	SUPP	pcs	12.249900
2270	PAK00111	PACKING BERDIRI 49	100.0000	PAK00006	KARTON, BC 4.0	8.1633	SUPP	0	Active	0	SUPP	kg	12.249900
2271	PAK00111	PACKING BERDIRI 49	100.0000	PAK00002	LAKBAN, BC 4.0	24.4898	SUPP	0	Active	1	SUPP	mtr	4.083300
2272	PAK00111	PACKING BERDIRI 49	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.0204	SUPP	0	Active	2	SUPP	kg	98.000800
2273	PAK00111	PACKING BERDIRI 49	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	1.4286	SUPP	0	Active	3	SUPP	kg	69.998600
2274	PAK00111	PACKING BERDIRI 49	100.0000	PAK00007	STRAPPING BAND, BC 4.0	117.7551	SUPP	0	Active	4	SUPP	mtr	0.849200
2275	PAK00111	PACKING BERDIRI 49	100.0000	PAK00071	PAKU 1 3/4"	4.7347	SUPP	0	Active	5	SUPP	kg	21.120700
2276	PAK00111	PACKING BERDIRI 49	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0484	SUPP	0	Active	6	WADA	m3	2066.115700
2277	PAK00111	PACKING BERDIRI 49	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0172	SUPP	0	Active	7	WADA	m3	5813.953500
2278	PAK00111	PACKING BERDIRI 49	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0431	SUPP	0	Active	8	WADA	m3	2320.185600
2279	PAK00111	PACKING BERDIRI 49	100.0000	PAK00008	GRIPPER, BC 4.0	30.6122	SUPP	0	Active	9	SUPP	pcs	3.266700
2280	PAK00112	PACKING TUMPUK 41	100.0000	PAK00006	KARTON, BC 4.0	9.7561	SUPP	0	Active	0	SUPP	kg	10.250000
2281	PAK00112	PACKING TUMPUK 41	100.0000	PAK00002	LAKBAN, BC 4.0	29.2683	SUPP	0	Active	1	SUPP	mtr	3.416700
2282	PAK00112	PACKING TUMPUK 41	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.2195	SUPP	0	Active	2	SUPP	kg	82.000800
2283	PAK00112	PACKING TUMPUK 41	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.8537	SUPP	0	Active	3	SUPP	kg	117.137200
2284	PAK00112	PACKING TUMPUK 41	100.0000	PAK00007	STRAPPING BAND, BC 4.0	64.6341	SUPP	0	Active	4	SUPP	mtr	1.547200
2285	PAK00112	PACKING TUMPUK 41	100.0000	PAK00071	PAKU 1 3/4"	1.7073	SUPP	0	Active	5	SUPP	kg	58.572000
2286	PAK00112	PACKING TUMPUK 41	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0321	SUPP	0	Active	6	WADA	m3	3115.264800
2287	PAK00112	PACKING TUMPUK 41	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0206	SUPP	0	Active	7	WADA	m3	4854.368900
2288	PAK00112	PACKING TUMPUK 41	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0082	SUPP	0	Active	8	WADA	m3	12195.122000
2289	PAK00112	PACKING TUMPUK 41	100.0000	PAK00008	GRIPPER, BC 4.0	9.7561	SUPP	0	Active	9	SUPP	pcs	10.250000
2290	PAK00113	PACKING TUMPUK SEPATU 41	100.0000	PAK00006	KARTON, BC 4.0	9.7561	SUPP	0	Active	0	SUPP	kg	10.250000
2291	PAK00113	PACKING TUMPUK SEPATU 41	100.0000	PAK00002	LAKBAN, BC 4.0	29.2683	SUPP	0	Active	1	SUPP	mtr	3.416700
2292	PAK00113	PACKING TUMPUK SEPATU 41	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.2195	SUPP	0	Active	2	SUPP	kg	82.000800
2293	PAK00113	PACKING TUMPUK SEPATU 41	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.8537	SUPP	0	Active	3	SUPP	kg	117.137200
2294	PAK00113	PACKING TUMPUK SEPATU 41	100.0000	PAK00007	STRAPPING BAND, BC 4.0	64.6341	SUPP	0	Active	4	SUPP	mtr	1.547200
2295	PAK00113	PACKING TUMPUK SEPATU 41	100.0000	PAK00071	PAKU 1 3/4"	4.7805	SUPP	0	Active	5	SUPP	kg	20.918300
2296	PAK00113	PACKING TUMPUK SEPATU 41	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0385	SUPP	0	Active	6	WADA	m3	2597.402600
2297	PAK00113	PACKING TUMPUK SEPATU 41	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0165	SUPP	0	Active	7	WADA	m3	6060.606100
2298	PAK00113	PACKING TUMPUK SEPATU 41	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0412	SUPP	0	Active	8	WADA	m3	2427.184500
2299	PAK00113	PACKING TUMPUK SEPATU 41	100.0000	PAK00008	GRIPPER, BC 4.0	9.7561	SUPP	0	Active	9	SUPP	pcs	10.250000
2300	PAK00114	PACKING BERDIRI 41	100.0000	PAK00006	KARTON, BC 4.0	9.7561	SUPP	0	Active	0	SUPP	kg	10.250000
2301	PAK00114	PACKING BERDIRI 41	100.0000	PAK00002	LAKBAN, BC 4.0	29.2683	SUPP	0	Active	1	SUPP	mtr	3.416700
2302	PAK00114	PACKING BERDIRI 41	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.2195	SUPP	0	Active	2	SUPP	kg	82.000800
2303	PAK00114	PACKING BERDIRI 41	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	1.7073	SUPP	0	Active	3	SUPP	kg	58.572000
2304	PAK00114	PACKING BERDIRI 41	100.0000	PAK00007	STRAPPING BAND, BC 4.0	140.7317	SUPP	0	Active	4	SUPP	mtr	0.710600
2305	PAK00114	PACKING BERDIRI 41	100.0000	PAK00071	PAKU 1 3/4"	5.6585	SUPP	0	Active	5	SUPP	kg	17.672500
2306	PAK00114	PACKING BERDIRI 41	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0578	SUPP	0	Active	6	WADA	m3	1730.103800
2307	PAK00114	PACKING BERDIRI 41	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0206	SUPP	0	Active	7	WADA	m3	4854.368900
2308	PAK00114	PACKING BERDIRI 41	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0515	SUPP	0	Active	8	WADA	m3	1941.747600
2309	PAK00114	PACKING BERDIRI 41	100.0000	PAK00008	GRIPPER, BC 4.0	36.5854	SUPP	0	Active	9	SUPP	pcs	2.733300
2310	PAK00115	PACKING TUMPUK 36	100.0000	PAK00006	KARTON, BC 4.0	11.1111	SUPP	0	Active	0	SUPP	kg	9.000000
2311	PAK00115	PACKING TUMPUK 36	100.0000	PAK00002	LAKBAN, BC 4.0	33.3333	SUPP	0	Active	1	SUPP	mtr	3.000000
2312	PAK00115	PACKING TUMPUK 36	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.3889	SUPP	0	Active	2	SUPP	kg	71.999400
2313	PAK00115	PACKING TUMPUK 36	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.9722	SUPP	0	Active	3	SUPP	kg	102.859500
2314	PAK00115	PACKING TUMPUK 36	100.0000	PAK00007	STRAPPING BAND, BC 4.0	73.6111	SUPP	0	Active	4	SUPP	mtr	1.358500
2315	PAK00115	PACKING TUMPUK 36	100.0000	PAK00071	PAKU 1 3/4"	1.9444	SUPP	0	Active	5	SUPP	kg	51.429700
2316	PAK00115	PACKING TUMPUK 36	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0366	SUPP	0	Active	6	WADA	m3	2732.240400
2317	PAK00115	PACKING TUMPUK 36	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0235	SUPP	0	Active	7	WADA	m3	4255.319100
2318	PAK00115	PACKING TUMPUK 36	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0094	SUPP	0	Active	8	WADA	m3	10638.297900
2319	PAK00115	PACKING TUMPUK 36	100.0000	PAK00008	GRIPPER, BC 4.0	11.1111	SUPP	0	Active	9	SUPP	pcs	9.000000
2320	PAK00116	PACKING TUMPUK SEPATU 36	100.0000	PAK00006	KARTON, BC 4.0	11.1111	SUPP	0	Active	0	SUPP	kg	9.000000
2321	PAK00116	PACKING TUMPUK SEPATU 36	100.0000	PAK00002	LAKBAN, BC 4.0	33.3333	SUPP	0	Active	1	SUPP	mtr	3.000000
2322	PAK00116	PACKING TUMPUK SEPATU 36	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.3889	SUPP	0	Active	2	SUPP	kg	71.999400
2323	PAK00116	PACKING TUMPUK SEPATU 36	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.9722	SUPP	0	Active	3	SUPP	kg	102.859500
2324	PAK00116	PACKING TUMPUK SEPATU 36	100.0000	PAK00007	STRAPPING BAND, BC 4.0	73.6111	SUPP	0	Active	4	SUPP	mtr	1.358500
2325	PAK00116	PACKING TUMPUK SEPATU 36	100.0000	PAK00071	PAKU 1 3/4"	5.4444	SUPP	0	Active	5	SUPP	kg	18.367500
2326	PAK00116	PACKING TUMPUK SEPATU 36	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0439	SUPP	0	Active	6	WADA	m3	2277.904300
2327	PAK00116	PACKING TUMPUK SEPATU 36	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0188	SUPP	0	Active	7	WADA	m3	5319.148900
2328	PAK00116	PACKING TUMPUK SEPATU 36	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0469	SUPP	0	Active	8	WADA	m3	2132.196200
2329	PAK00116	PACKING TUMPUK SEPATU 36	100.0000	PAK00008	GRIPPER, BC 4.0	11.1111	SUPP	0	Active	9	SUPP	pcs	9.000000
2330	PAK00117	PACKING BERDIRI 36	100.0000	PAK00006	KARTON, BC 4.0	11.1111	SUPP	0	Active	0	SUPP	kg	9.000000
2331	PAK00117	PACKING BERDIRI 36	100.0000	PAK00002	LAKBAN, BC 4.0	33.3333	SUPP	0	Active	1	SUPP	mtr	3.000000
2332	PAK00117	PACKING BERDIRI 36	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.3889	SUPP	0	Active	2	SUPP	kg	71.999400
2333	PAK00117	PACKING BERDIRI 36	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	1.9444	SUPP	0	Active	3	SUPP	kg	51.429700
2334	PAK00117	PACKING BERDIRI 36	100.0000	PAK00007	STRAPPING BAND, BC 4.0	160.2778	SUPP	0	Active	4	SUPP	mtr	0.623900
2335	PAK00117	PACKING BERDIRI 36	100.0000	PAK00071	PAKU 1 3/4"	6.4444	SUPP	0	Active	5	SUPP	kg	15.517300
2336	PAK00117	PACKING BERDIRI 36	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0658	SUPP	0	Active	6	WADA	m3	1519.756800
2337	PAK00117	PACKING BERDIRI 36	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0235	SUPP	0	Active	7	WADA	m3	4255.319100
2338	PAK00117	PACKING BERDIRI 36	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0587	SUPP	0	Active	8	WADA	m3	1703.577500
2339	PAK00117	PACKING BERDIRI 36	100.0000	PAK00008	GRIPPER, BC 4.0	41.6667	SUPP	0	Active	9	SUPP	pcs	2.400000
2340	PAK00118	PACKING TUMPUK 34	100.0000	PAK00006	KARTON, BC 4.0	11.7647	SUPP	0	Active	0	SUPP	kg	8.500000
2341	PAK00118	PACKING TUMPUK 34	100.0000	PAK00002	LAKBAN, BC 4.0	35.2941	SUPP	0	Active	1	SUPP	mtr	2.833300
2342	PAK00118	PACKING TUMPUK 34	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.4706	SUPP	0	Active	2	SUPP	kg	67.999500
2343	PAK00118	PACKING TUMPUK 34	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	1.0294	SUPP	0	Active	3	SUPP	kg	97.144000
2344	PAK00118	PACKING TUMPUK 34	100.0000	PAK00007	STRAPPING BAND, BC 4.0	77.9412	SUPP	0	Active	4	SUPP	mtr	1.283000
2345	PAK00118	PACKING TUMPUK 34	100.0000	PAK00071	PAKU 1 3/4"	2.0588	SUPP	0	Active	5	SUPP	kg	48.572000
2346	PAK00118	PACKING TUMPUK 34	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0387	SUPP	0	Active	6	WADA	m3	2583.979300
2347	PAK00118	PACKING TUMPUK 34	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0249	SUPP	0	Active	7	WADA	m3	4016.064300
2348	PAK00118	PACKING TUMPUK 34	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0099	SUPP	0	Active	8	WADA	m3	10101.010100
2349	PAK00118	PACKING TUMPUK 34	100.0000	PAK00008	GRIPPER, BC 4.0	11.7647	SUPP	0	Active	9	SUPP	pcs	8.500000
2350	PAK00119	PACKING TUMPUK SEPATU 34	100.0000	PAK00006	KARTON, BC 4.0	11.7647	SUPP	0	Active	0	SUPP	kg	8.500000
2351	PAK00119	PACKING TUMPUK SEPATU 34	100.0000	PAK00002	LAKBAN, BC 4.0	35.2941	SUPP	0	Active	1	SUPP	mtr	2.833300
2352	PAK00119	PACKING TUMPUK SEPATU 34	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.4706	SUPP	0	Active	2	SUPP	kg	67.999500
2353	PAK00119	PACKING TUMPUK SEPATU 34	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	1.0294	SUPP	0	Active	3	SUPP	kg	97.144000
2354	PAK00119	PACKING TUMPUK SEPATU 34	100.0000	PAK00007	STRAPPING BAND, BC 4.0	77.9412	SUPP	0	Active	4	SUPP	mtr	1.283000
2355	PAK00119	PACKING TUMPUK SEPATU 34	100.0000	PAK00071	PAKU 1 3/4"	5.7647	SUPP	0	Active	5	SUPP	kg	17.347000
2356	PAK00119	PACKING TUMPUK SEPATU 34	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0465	SUPP	0	Active	6	WADA	m3	2150.537600
2357	PAK00119	PACKING TUMPUK SEPATU 34	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0199	SUPP	0	Active	7	WADA	m3	5025.125600
2358	PAK00119	PACKING TUMPUK SEPATU 34	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0497	SUPP	0	Active	8	WADA	m3	2012.072400
2359	PAK00119	PACKING TUMPUK SEPATU 34	100.0000	PAK00008	GRIPPER, BC 4.0	11.7647	SUPP	0	Active	9	SUPP	pcs	8.500000
2360	PAK00120	PACKING BERDIRI P.2500/34	100.0000	PAK00006	KARTON, BC 4.0	11.7647	SUPP	0	Active	0	SUPP	kg	8.500000
2361	PAK00120	PACKING BERDIRI P.2500/34	100.0000	PAK00002	LAKBAN, BC 4.0	35.2941	SUPP	0	Active	1	SUPP	mtr	2.833300
2362	PAK00120	PACKING BERDIRI P.2500/34	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.4706	SUPP	0	Active	2	SUPP	kg	67.999500
2363	PAK00120	PACKING BERDIRI P.2500/34	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	2.0588	SUPP	0	Active	3	SUPP	kg	48.572000
2364	PAK00120	PACKING BERDIRI P.2500/34	100.0000	PAK00007	STRAPPING BAND, BC 4.0	169.7059	SUPP	0	Active	4	SUPP	mtr	0.589300
2365	PAK00120	PACKING BERDIRI P.2500/34	100.0000	PAK00071	PAKU 1 3/4"	6.8235	SUPP	0	Active	5	SUPP	kg	14.655200
2366	PAK00120	PACKING BERDIRI P.2500/34	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0697	SUPP	0	Active	6	WADA	m3	1434.720200
2367	PAK00120	PACKING BERDIRI P.2500/34	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0249	SUPP	0	Active	7	WADA	m3	4016.064300
2368	PAK00120	PACKING BERDIRI P.2500/34	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0621	SUPP	0	Active	8	WADA	m3	1610.306000
2369	PAK00120	PACKING BERDIRI P.2500/34	100.0000	PAK00008	GRIPPER, BC 4.0	44.1176	SUPP	0	Active	9	SUPP	pcs	2.266700
2370	PAK00121	PACKING TUMPUK 30	100.0000	PAK00006	KARTON, BC 4.0	13.3333	SUPP	100	Active	0	SUPP	kg	7.500000
2371	PAK00121	PACKING TUMPUK 30	100.0000	PAK00002	LAKBAN, BC 4.0	40	SUPP	100	Active	1	SUPP	mtr	2.500000
2372	PAK00121	PACKING TUMPUK 30	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.6667	SUPP	100	Active	2	SUPP	kg	59.998800
2373	PAK00121	PACKING TUMPUK 30	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	1.1667	SUPP	100	Active	3	SUPP	kg	85.711800
2374	PAK00121	PACKING TUMPUK 30	100.0000	PAK00007	STRAPPING BAND, BC 4.0	88.3333	SUPP	100	Active	4	SUPP	mtr	1.132100
2375	PAK00121	PACKING TUMPUK 30	100.0000	PAK00071	PAKU 1 3/4"	2.3333	SUPP	100	Active	5	SUPP	kg	42.857800
2376	PAK00121	PACKING TUMPUK 30	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0439	SUPP	100	Active	6	WADA	m3	2277.904300
2377	PAK00121	PACKING TUMPUK 30	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0282	SUPP	100	Active	7	WADA	m3	3546.099300
2378	PAK00121	PACKING TUMPUK 30	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0113	SUPP	100	Active	8	WADA	m3	8849.557500
2379	PAK00121	PACKING TUMPUK 30	100.0000	PAK00008	GRIPPER, BC 4.0	13.3333	SUPP	100	Active	9	SUPP	pcs	7.500000
2380	PAK00122	PACKING TUMPUK SEPATU 30	100.0000	PAK00006	KARTON, BC 4.0	13.3333	SUPP	0	Active	0	SUPP	kg	7.500000
2381	PAK00122	PACKING TUMPUK SEPATU 30	100.0000	PAK00002	LAKBAN, BC 4.0	40	SUPP	0	Active	1	SUPP	mtr	2.500000
2382	PAK00122	PACKING TUMPUK SEPATU 30	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.6667	SUPP	0	Active	2	SUPP	kg	59.998800
2383	PAK00122	PACKING TUMPUK SEPATU 30	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	1.1667	SUPP	0	Active	3	SUPP	kg	85.711800
2384	PAK00122	PACKING TUMPUK SEPATU 30	100.0000	PAK00007	STRAPPING BAND, BC 4.0	88.3333	SUPP	0	Active	4	SUPP	mtr	1.132100
2385	PAK00122	PACKING TUMPUK SEPATU 30	100.0000	PAK00071	PAKU 1 3/4"	6.5333	SUPP	0	Active	5	SUPP	kg	15.306200
2386	PAK00122	PACKING TUMPUK SEPATU 30	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0527	SUPP	0	Active	6	WADA	m3	1897.533200
2387	PAK00122	PACKING TUMPUK SEPATU 30	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0225	SUPP	0	Active	7	WADA	m3	4444.444400
2388	PAK00122	PACKING TUMPUK SEPATU 30	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0563	SUPP	0	Active	8	WADA	m3	1776.198900
2389	PAK00122	PACKING TUMPUK SEPATU 30	100.0000	PAK00008	GRIPPER, BC 4.0	13.3333	SUPP	0	Active	9	SUPP	pcs	7.500000
2390	PAK00123	PACKING BERDIRI 30	100.0000	PAK00006	KARTON, BC 4.0	13.3333	SUPP	0	Active	0	SUPP	kg	7.500000
2391	PAK00123	PACKING BERDIRI 30	100.0000	PAK00002	LAKBAN, BC 4.0	40	SUPP	0	Active	1	SUPP	mtr	2.500000
2392	PAK00123	PACKING BERDIRI 30	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.6667	SUPP	0	Active	2	SUPP	kg	59.998800
2393	PAK00123	PACKING BERDIRI 30	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	2.3333	SUPP	0	Active	3	SUPP	kg	42.857800
2394	PAK00123	PACKING BERDIRI 30	100.0000	PAK00007	STRAPPING BAND, BC 4.0	192.3333	SUPP	0	Active	4	SUPP	mtr	0.519900
2395	PAK00123	PACKING BERDIRI 30	100.0000	PAK00071	PAKU 1 3/4"	7.7333	SUPP	0	Active	5	SUPP	kg	12.931100
2396	PAK00123	PACKING BERDIRI 30	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.079	SUPP	0	Active	6	WADA	m3	1265.822800
2397	PAK00123	PACKING BERDIRI 30	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0282	SUPP	0	Active	7	WADA	m3	3546.099300
2398	PAK00123	PACKING BERDIRI 30	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0704	SUPP	0	Active	8	WADA	m3	1420.454500
2399	PAK00123	PACKING BERDIRI 30	100.0000	PAK00008	GRIPPER, BC 4.0	50	SUPP	0	Active	9	SUPP	pcs	2.000000
2400	PAK00124	PACKING TUMPUK P.2500/25	100.0000	PAK00006	KARTON, BC 4.0	16	SUPP	0	Active	0	SUPP	kg	6.250000
2401	PAK00124	PACKING TUMPUK P.2500/25	100.0000	PAK00002	LAKBAN, BC 4.0	48	SUPP	0	Active	1	SUPP	mtr	2.083300
2402	PAK00124	PACKING TUMPUK P.2500/25	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	2	SUPP	0	Active	2	SUPP	kg	50.000000
2403	PAK00124	PACKING TUMPUK P.2500/25	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	1.4	SUPP	0	Active	3	SUPP	kg	71.428600
2404	PAK00124	PACKING TUMPUK P.2500/25	100.0000	PAK00007	STRAPPING BAND, BC 4.0	106	SUPP	0	Active	4	SUPP	mtr	0.943400
2405	PAK00124	PACKING TUMPUK P.2500/25	100.0000	PAK00071	PAKU 1 3/4"	2.8	SUPP	0	Active	5	SUPP	kg	35.714300
2406	PAK00124	PACKING TUMPUK P.2500/25	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0527	SUPP	0	Active	6	WADA	m3	1897.533200
2407	PAK00124	PACKING TUMPUK P.2500/25	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0338	SUPP	0	Active	7	WADA	m3	2958.579900
2408	PAK00124	PACKING TUMPUK P.2500/25	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0135	SUPP	0	Active	8	WADA	m3	7407.407400
2409	PAK00124	PACKING TUMPUK P.2500/25	100.0000	PAK00008	GRIPPER, BC 4.0	16	SUPP	0	Active	9	SUPP	pcs	6.250000
2410	PAK00125	PACKING TUMPUK SEPATU 25	100.0000	PAK00006	KARTON, BC 4.0	16	SUPP	0	Active	0	SUPP	kg	6.250000
2411	PAK00125	PACKING TUMPUK SEPATU 25	100.0000	PAK00002	LAKBAN, BC 4.0	48	SUPP	0	Active	1	SUPP	mtr	2.083300
2412	PAK00125	PACKING TUMPUK SEPATU 25	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	2	SUPP	0	Active	2	SUPP	kg	50.000000
2413	PAK00125	PACKING TUMPUK SEPATU 25	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	1.4	SUPP	0	Active	3	SUPP	kg	71.428600
2414	PAK00125	PACKING TUMPUK SEPATU 25	100.0000	PAK00007	STRAPPING BAND, BC 4.0	106	SUPP	0	Active	4	SUPP	mtr	0.943400
2415	PAK00125	PACKING TUMPUK SEPATU 25	100.0000	PAK00071	PAKU 1 3/4"	7.84	SUPP	0	Active	5	SUPP	kg	12.755100
2416	PAK00125	PACKING TUMPUK SEPATU 25	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0632	SUPP	0	Active	6	WADA	m3	1582.278500
2417	PAK00125	PACKING TUMPUK SEPATU 25	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.027	SUPP	0	Active	7	WADA	m3	3703.703700
2418	PAK00125	PACKING TUMPUK SEPATU 25	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0676	SUPP	0	Active	8	WADA	m3	1479.289900
2419	PAK00125	PACKING TUMPUK SEPATU 25	100.0000	PAK00008	GRIPPER, BC 4.0	16	SUPP	0	Active	9	SUPP	pcs	6.250000
2420	PAK00126	PACKING BERDIRI P.2500	100.0000	PAK00006	KARTON, BC 4.0	16	SUPP	0	Active	0	SUPP	kg	6.250000
2421	PAK00126	PACKING BERDIRI P.2500	100.0000	PAK00002	LAKBAN, BC 4.0	48	SUPP	0	Active	1	SUPP	mtr	2.083300
2422	PAK00126	PACKING BERDIRI P.2500	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	2	SUPP	0	Active	2	SUPP	kg	50.000000
2423	PAK00126	PACKING BERDIRI P.2500	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	2.8	SUPP	0	Active	3	SUPP	kg	35.714300
2424	PAK00126	PACKING BERDIRI P.2500	100.0000	PAK00007	STRAPPING BAND, BC 4.0	230.8	SUPP	0	Active	4	SUPP	mtr	0.433300
2425	PAK00126	PACKING BERDIRI P.2500	100.0000	PAK00071	PAKU 1 3/4"	9.28	SUPP	0	Active	5	SUPP	kg	10.775900
2426	PAK00126	PACKING BERDIRI P.2500	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0948	SUPP	0	Active	6	WADA	m3	1054.852300
2427	PAK00126	PACKING BERDIRI P.2500	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0338	SUPP	0	Active	7	WADA	m3	2958.579900
2428	PAK00126	PACKING BERDIRI P.2500	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0845	SUPP	0	Active	8	WADA	m3	1183.432000
2429	PAK00126	PACKING BERDIRI P.2500	100.0000	PAK00008	GRIPPER, BC 4.0	60	SUPP	0	Active	9	SUPP	pcs	1.666700
2430	PAK00127	PACKING BERDIRI 290	100.0000	PAK00006	KARTON, BC 4.0	1.3793	SUPP	0	Active	0	SUPP	kg	72.500500
2431	PAK00127	PACKING BERDIRI 290	100.0000	PAK00002	LAKBAN, BC 4.0	4.1379	SUPP	0	Active	1	SUPP	mtr	24.166800
2432	PAK00127	PACKING BERDIRI 290	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.1724	SUPP	0	Active	2	SUPP	kg	580.046400
2433	PAK00127	PACKING BERDIRI 290	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.2414	SUPP	0	Active	3	SUPP	kg	414.250200
2434	PAK00127	PACKING BERDIRI 290	100.0000	PAK00007	STRAPPING BAND, BC 4.0	19.8966	SUPP	0	Active	4	SUPP	mtr	5.026000
2435	PAK00127	PACKING BERDIRI 290	100.0000	PAK00071	PAKU 1 3/4"	0.8	SUPP	0	Active	5	SUPP	kg	125.000000
2436	PAK00127	PACKING BERDIRI 290	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0082	SUPP	0	Active	6	WADA	m3	12195.122000
2437	PAK00127	PACKING BERDIRI 290	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0029	SUPP	0	Active	7	WADA	m3	34482.758600
2438	PAK00127	PACKING BERDIRI 290	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0073	SUPP	0	Active	8	WADA	m3	13698.630100
2439	PAK00127	PACKING BERDIRI 290	100.0000	PAK00008	GRIPPER, BC 4.0	5.1724	SUPP	0	Active	9	SUPP	pcs	19.333400
2440	PAK00128	PACKING BERDIRI 225	100.0000	PAK00006	KARTON, BC 4.0	1.7778	SUPP	0	Active	0	SUPP	kg	56.249300
2441	PAK00128	PACKING BERDIRI 225	100.0000	PAK00002	LAKBAN, BC 4.0	5.3333	SUPP	0	Active	1	SUPP	mtr	18.750100
2442	PAK00128	PACKING BERDIRI 225	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.2222	SUPP	0	Active	2	SUPP	kg	450.045000
2443	PAK00128	PACKING BERDIRI 225	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.3111	SUPP	0	Active	3	SUPP	kg	321.440100
2444	PAK00128	PACKING BERDIRI 225	100.0000	PAK00007	STRAPPING BAND, BC 4.0	25.6444	SUPP	0	Active	4	SUPP	mtr	3.899500
2445	PAK00128	PACKING BERDIRI 225	100.0000	PAK00071	PAKU 1 3/4"	1.0311	SUPP	0	Active	5	SUPP	kg	96.983800
2446	PAK00128	PACKING BERDIRI 225	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0105	SUPP	0	Active	6	WADA	m3	9523.809500
2447	PAK00128	PACKING BERDIRI 225	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0038	SUPP	0	Active	7	WADA	m3	26315.789500
2448	PAK00128	PACKING BERDIRI 225	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0094	SUPP	0	Active	8	WADA	m3	10638.297900
2449	PAK00128	PACKING BERDIRI 225	100.0000	PAK00008	GRIPPER, BC 4.0	6.6667	SUPP	0	Active	9	SUPP	pcs	14.999900
2450	PAK00129	PACKING BERDIRI 160	100.0000	PAK00006	KARTON, BC 4.0	2.5	SUPP	0	Active	0	SUPP	kg	40.000000
2451	PAK00129	PACKING BERDIRI 160	100.0000	PAK00002	LAKBAN, BC 4.0	7.5	SUPP	0	Active	1	SUPP	mtr	13.333300
2452	PAK00129	PACKING BERDIRI 160	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.3125	SUPP	0	Active	2	SUPP	kg	320.000000
2453	PAK00129	PACKING BERDIRI 160	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.4375	SUPP	0	Active	3	SUPP	kg	228.571400
2454	PAK00129	PACKING BERDIRI 160	100.0000	PAK00007	STRAPPING BAND, BC 4.0	36.0625	SUPP	0	Active	4	SUPP	mtr	2.773000
2455	PAK00129	PACKING BERDIRI 160	100.0000	PAK00071	PAKU 1 3/4"	1.45	SUPP	0	Active	5	SUPP	kg	68.965500
2456	PAK00129	PACKING BERDIRI 160	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0148	SUPP	0	Active	6	WADA	m3	6756.756800
2457	PAK00129	PACKING BERDIRI 160	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0053	SUPP	0	Active	7	WADA	m3	18867.924500
2458	PAK00129	PACKING BERDIRI 160	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0132	SUPP	0	Active	8	WADA	m3	7575.757600
2459	PAK00129	PACKING BERDIRI 160	100.0000	PAK00008	GRIPPER, BC 4.0	9.375	SUPP	0	Active	9	SUPP	pcs	10.666700
2460	PAK00130	PACKING BERDIRI 120	100.0000	PAK00006	KARTON, BC 4.0	3.3333	SUPP	0	Active	0	SUPP	kg	30.000300
2461	PAK00130	PACKING BERDIRI 120	100.0000	PAK00002	LAKBAN, BC 4.0	10	SUPP	0	Active	1	SUPP	mtr	10.000000
2462	PAK00130	PACKING BERDIRI 120	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.4167	SUPP	0	Active	2	SUPP	kg	239.980800
2463	PAK00130	PACKING BERDIRI 120	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.5833	SUPP	0	Active	3	SUPP	kg	171.438400
2464	PAK00130	PACKING BERDIRI 120	100.0000	PAK00007	STRAPPING BAND, BC 4.0	48.0833	SUPP	0	Active	4	SUPP	mtr	2.079700
2465	PAK00130	PACKING BERDIRI 120	100.0000	PAK00071	PAKU 1 3/4"	1.9333	SUPP	0	Active	5	SUPP	kg	51.725000
2466	PAK00130	PACKING BERDIRI 120	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0197	SUPP	0	Active	6	WADA	m3	5076.142100
2467	PAK00130	PACKING BERDIRI 120	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.007	SUPP	0	Active	7	WADA	m3	14285.714300
2468	PAK00130	PACKING BERDIRI 120	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0176	SUPP	0	Active	8	WADA	m3	5681.818200
2469	PAK00130	PACKING BERDIRI 120	100.0000	PAK00008	GRIPPER, BC 4.0	12.5	SUPP	0	Active	9	SUPP	pcs	8.000000
2470	PAK00131	PACKING BERDIRI 110	100.0000	PAK00006	KARTON, BC 4.0	3.6364	SUPP	0	Active	0	SUPP	kg	27.499700
2471	PAK00131	PACKING BERDIRI 110	100.0000	PAK00002	LAKBAN, BC 4.0	10.9091	SUPP	0	Active	1	SUPP	mtr	9.166700
2472	PAK00131	PACKING BERDIRI 110	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.4545	SUPP	0	Active	2	SUPP	kg	220.022000
2473	PAK00131	PACKING BERDIRI 110	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.6364	SUPP	0	Active	3	SUPP	kg	157.133900
2474	PAK00131	PACKING BERDIRI 110	100.0000	PAK00007	STRAPPING BAND, BC 4.0	52.4545	SUPP	0	Active	4	SUPP	mtr	1.906400
2475	PAK00131	PACKING BERDIRI 110	100.0000	PAK00071	PAKU 1 3/4"	2.1091	SUPP	0	Active	5	SUPP	kg	47.413600
2476	PAK00131	PACKING BERDIRI 110	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0215	SUPP	0	Active	6	WADA	m3	4651.162800
2477	PAK00131	PACKING BERDIRI 110	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0077	SUPP	0	Active	7	WADA	m3	12987.013000
2478	PAK00131	PACKING BERDIRI 110	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0192	SUPP	0	Active	8	WADA	m3	5208.333300
2479	PAK00131	PACKING BERDIRI 110	100.0000	PAK00008	GRIPPER, BC 4.0	13.6364	SUPP	0	Active	9	SUPP	pcs	7.333300
2480	PAK00132	PACKING BERDIRI 100	100.0000	PAK00006	KARTON, BC 4.0	4	SUPP	0	Active	0	SUPP	kg	25.000000
2481	PAK00132	PACKING BERDIRI 100	100.0000	PAK00002	LAKBAN, BC 4.0	12	SUPP	0	Active	1	SUPP	mtr	8.333300
2482	PAK00132	PACKING BERDIRI 100	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.5	SUPP	0	Active	2	SUPP	kg	200.000000
2483	PAK00132	PACKING BERDIRI 100	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.7	SUPP	0	Active	3	SUPP	kg	142.857100
2484	PAK00132	PACKING BERDIRI 100	100.0000	PAK00007	STRAPPING BAND, BC 4.0	57.7	SUPP	0	Active	4	SUPP	mtr	1.733100
2485	PAK00132	PACKING BERDIRI 100	100.0000	PAK00071	PAKU 1 3/4"	2.32	SUPP	0	Active	5	SUPP	kg	43.103400
2486	PAK00132	PACKING BERDIRI 100	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0237	SUPP	0	Active	6	WADA	m3	4219.409300
2487	PAK00132	PACKING BERDIRI 100	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0085	SUPP	0	Active	7	WADA	m3	11764.705900
2488	PAK00132	PACKING BERDIRI 100	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0211	SUPP	0	Active	8	WADA	m3	4739.336500
2489	PAK00132	PACKING BERDIRI 100	100.0000	PAK00008	GRIPPER, BC 4.0	15	SUPP	0	Active	9	SUPP	pcs	6.666700
2490	PAK00133	PACKING BERDIRI 85	100.0000	PAK00006	KARTON, BC 4.0	4.7059	SUPP	0	Active	0	SUPP	kg	21.249900
2491	PAK00133	PACKING BERDIRI 85	100.0000	PAK00002	LAKBAN, BC 4.0	14.1176	SUPP	0	Active	1	SUPP	mtr	7.083400
2492	PAK00133	PACKING BERDIRI 85	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.5882	SUPP	0	Active	2	SUPP	kg	170.010200
2493	PAK00133	PACKING BERDIRI 85	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.8235	SUPP	0	Active	3	SUPP	kg	121.432900
2494	PAK00133	PACKING BERDIRI 85	100.0000	PAK00007	STRAPPING BAND, BC 4.0	67.8824	SUPP	0	Active	4	SUPP	mtr	1.473100
2495	PAK00133	PACKING BERDIRI 85	100.0000	PAK00071	PAKU 1 3/4"	2.7294	SUPP	0	Active	5	SUPP	kg	36.638100
2496	PAK00133	PACKING BERDIRI 85	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0279	SUPP	0	Active	6	WADA	m3	3584.229400
2497	PAK00133	PACKING BERDIRI 85	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0099	SUPP	0	Active	7	WADA	m3	10101.010100
2498	PAK00133	PACKING BERDIRI 85	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0249	SUPP	0	Active	8	WADA	m3	4016.064300
2499	PAK00133	PACKING BERDIRI 85	100.0000	PAK00008	GRIPPER, BC 4.0	17.6471	SUPP	0	Active	9	SUPP	pcs	5.666700
2500	PAK00134	PACKING BERDIRI 68	100.0000	PAK00006	KARTON, BC 4.0	5.8824	SUPP	0	Active	0	SUPP	kg	16.999900
2501	PAK00134	PACKING BERDIRI 68	100.0000	PAK00002	LAKBAN, BC 4.0	17.6471	SUPP	0	Active	1	SUPP	mtr	5.666700
2502	PAK00134	PACKING BERDIRI 68	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.7353	SUPP	0	Active	2	SUPP	kg	135.998900
2503	PAK00134	PACKING BERDIRI 68	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	1.0294	SUPP	0	Active	3	SUPP	kg	97.144000
2504	PAK00134	PACKING BERDIRI 68	100.0000	PAK00007	STRAPPING BAND, BC 4.0	84.8529	SUPP	0	Active	4	SUPP	mtr	1.178500
2505	PAK00134	PACKING BERDIRI 68	100.0000	PAK00071	PAKU 1 3/4"	3.4118	SUPP	0	Active	5	SUPP	kg	29.310000
2506	PAK00134	PACKING BERDIRI 68	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0348	SUPP	0	Active	6	WADA	m3	2873.563200
2507	PAK00134	PACKING BERDIRI 68	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0124	SUPP	0	Active	7	WADA	m3	8064.516100
2508	PAK00134	PACKING BERDIRI 68	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0311	SUPP	0	Active	8	WADA	m3	3215.434100
2509	PAK00134	PACKING BERDIRI 68	100.0000	PAK00008	GRIPPER, BC 4.0	22.0588	SUPP	0	Active	9	SUPP	pcs	4.533300
2510	PAK00135	PACKING BERDIRI 57	100.0000	PAK00006	KARTON, BC 4.0	7.0175	SUPP	0	Active	0	SUPP	kg	14.250100
2511	PAK00135	PACKING BERDIRI 57	100.0000	PAK00002	LAKBAN, BC 4.0	21.0526	SUPP	0	Active	1	SUPP	mtr	4.750000
2512	PAK00135	PACKING BERDIRI 57	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.8772	SUPP	0	Active	2	SUPP	kg	113.999100
2513	PAK00135	PACKING BERDIRI 57	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	1.2281	SUPP	0	Active	3	SUPP	kg	81.426600
2514	PAK00135	PACKING BERDIRI 57	100.0000	PAK00007	STRAPPING BAND, BC 4.0	101.2281	SUPP	0	Active	4	SUPP	mtr	0.987900
2515	PAK00135	PACKING BERDIRI 57	100.0000	PAK00071	PAKU 1 3/4"	4.0702	SUPP	0	Active	5	SUPP	kg	24.568800
2516	PAK00135	PACKING BERDIRI 57	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0416	SUPP	0	Active	6	WADA	m3	2403.846200
2517	PAK00135	PACKING BERDIRI 57	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0148	SUPP	0	Active	7	WADA	m3	6756.756800
2518	PAK00135	PACKING BERDIRI 57	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0371	SUPP	0	Active	8	WADA	m3	2695.417800
2519	PAK00135	PACKING BERDIRI 57	100.0000	PAK00008	GRIPPER, BC 4.0	26.3158	SUPP	0	Active	9	SUPP	pcs	3.800000
2520	PAK00136	PACKING BERDIRI 40	100.0000	PAK00006	KARTON, BC 4.0	10	SUPP	0	Active	0	SUPP	kg	10.000000
2521	PAK00136	PACKING BERDIRI 40	100.0000	PAK00002	LAKBAN, BC 4.0	30	SUPP	0	Active	1	SUPP	mtr	3.333300
2522	PAK00136	PACKING BERDIRI 40	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.25	SUPP	0	Active	2	SUPP	kg	80.000000
2523	PAK00136	PACKING BERDIRI 40	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	1.75	SUPP	0	Active	3	SUPP	kg	57.142900
2524	PAK00136	PACKING BERDIRI 40	100.0000	PAK00007	STRAPPING BAND, BC 4.0	144.25	SUPP	0	Active	4	SUPP	mtr	0.693200
2525	PAK00136	PACKING BERDIRI 40	100.0000	PAK00071	PAKU 1 3/4"	5.8	SUPP	0	Active	5	SUPP	kg	17.241400
2526	PAK00136	PACKING BERDIRI 40	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0592	SUPP	0	Active	6	WADA	m3	1689.189200
2527	PAK00136	PACKING BERDIRI 40	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0211	SUPP	0	Active	7	WADA	m3	4739.336500
2528	PAK00136	PACKING BERDIRI 40	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0528	SUPP	0	Active	8	WADA	m3	1893.939400
2529	PAK00136	PACKING BERDIRI 40	100.0000	PAK00008	GRIPPER, BC 4.0	37.5	SUPP	0	Active	9	SUPP	pcs	2.666700
2530	PAK00137	PACKING BERDIRI 34	100.0000	PAK00006	KARTON, BC 4.0	11.7647	SUPP	0	Active	0	SUPP	kg	8.500000
2531	PAK00137	PACKING BERDIRI 34	100.0000	PAK00002	LAKBAN, BC 4.0	35.2941	SUPP	0	Active	1	SUPP	mtr	2.833300
2532	PAK00137	PACKING BERDIRI 34	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.4706	SUPP	0	Active	2	SUPP	kg	67.999500
2533	PAK00137	PACKING BERDIRI 34	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	2.0588	SUPP	0	Active	3	SUPP	kg	48.572000
2534	PAK00137	PACKING BERDIRI 34	100.0000	PAK00007	STRAPPING BAND, BC 4.0	169.7059	SUPP	0	Active	4	SUPP	mtr	0.589300
2535	PAK00137	PACKING BERDIRI 34	100.0000	PAK00071	PAKU 1 3/4"	6.8235	SUPP	0	Active	5	SUPP	kg	14.655200
2536	PAK00137	PACKING BERDIRI 34	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0697	SUPP	0	Active	6	WADA	m3	1434.720200
2537	PAK00137	PACKING BERDIRI 34	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0249	SUPP	0	Active	7	WADA	m3	4016.064300
2538	PAK00137	PACKING BERDIRI 34	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0621	SUPP	0	Active	8	WADA	m3	1610.306000
2539	PAK00137	PACKING BERDIRI 34	100.0000	PAK00008	GRIPPER, BC 4.0	44.1176	SUPP	0	Active	9	SUPP	pcs	2.266700
2540	PAK00138	PACKING BERDIRI 25	100.0000	PAK00006	KARTON, BC 4.0	16	SUPP	0	Active	0	SUPP	kg	6.250000
2541	PAK00138	PACKING BERDIRI 25	100.0000	PAK00002	LAKBAN, BC 4.0	48	SUPP	0	Active	1	SUPP	mtr	2.083300
2542	PAK00138	PACKING BERDIRI 25	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	2	SUPP	0	Active	2	SUPP	kg	50.000000
2543	PAK00138	PACKING BERDIRI 25	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	2.8	SUPP	0	Active	3	SUPP	kg	35.714300
2544	PAK00138	PACKING BERDIRI 25	100.0000	PAK00007	STRAPPING BAND, BC 4.0	230.8	SUPP	0	Active	4	SUPP	mtr	0.433300
2545	PAK00138	PACKING BERDIRI 25	100.0000	PAK00071	PAKU 1 3/4"	9.28	SUPP	0	Active	5	SUPP	kg	10.775900
2546	PAK00138	PACKING BERDIRI 25	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0948	SUPP	0	Active	6	WADA	m3	1054.852300
2547	PAK00138	PACKING BERDIRI 25	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0338	SUPP	0	Active	7	WADA	m3	2958.579900
2548	PAK00138	PACKING BERDIRI 25	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0845	SUPP	0	Active	8	WADA	m3	1183.432000
2549	PAK00138	PACKING BERDIRI 25	100.0000	PAK00008	GRIPPER, BC 4.0	60	SUPP	0	Active	9	SUPP	pcs	1.666700
2550	PAK00139	PACKING BERDIRI 23	100.0000	PAK00006	KARTON, BC 4.0	17.3913	SUPP	0	Active	0	SUPP	kg	5.750000
2551	PAK00139	PACKING BERDIRI 23	100.0000	PAK00002	LAKBAN, BC 4.0	52.1739	SUPP	0	Active	1	SUPP	mtr	1.916700
2552	PAK00139	PACKING BERDIRI 23	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	2.1739	SUPP	0	Active	2	SUPP	kg	46.000300
2553	PAK00139	PACKING BERDIRI 23	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	3.0435	SUPP	0	Active	3	SUPP	kg	32.856900
2554	PAK00139	PACKING BERDIRI 23	100.0000	PAK00007	STRAPPING BAND, BC 4.0	250.8696	SUPP	0	Active	4	SUPP	mtr	0.398600
2555	PAK00139	PACKING BERDIRI 23	100.0000	PAK00071	PAKU 1 3/4"	10.087	SUPP	0	Active	5	SUPP	kg	9.913800
2556	PAK00139	PACKING BERDIRI 23	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.103	SUPP	0	Active	6	WADA	m3	970.873800
2557	PAK00139	PACKING BERDIRI 23	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0367	SUPP	0	Active	7	WADA	m3	2724.795600
2558	PAK00139	PACKING BERDIRI 23	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0918	SUPP	0	Active	8	WADA	m3	1089.324600
2559	PAK00139	PACKING BERDIRI 23	100.0000	PAK00008	GRIPPER, BC 4.0	65.2174	SUPP	0	Active	9	SUPP	pcs	1.533300
2560	PAK00140	PACKING TUMPUK 27	100.0000	PAK00006	KARTON, BC 4.0	14.8148	SUPP	0	Active	0	SUPP	kg	6.750000
2561	PAK00140	PACKING TUMPUK 27	100.0000	PAK00002	LAKBAN, BC 4.0	44.4444	SUPP	0	Active	1	SUPP	mtr	2.250000
2562	PAK00140	PACKING TUMPUK 27	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.8519	SUPP	0	Active	2	SUPP	kg	53.998600
2563	PAK00140	PACKING TUMPUK 27	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	1.2963	SUPP	0	Active	3	SUPP	kg	77.142600
2564	PAK00140	PACKING TUMPUK 27	100.0000	PAK00007	STRAPPING BAND, BC 4.0	98.1481	SUPP	0	Active	4	SUPP	mtr	1.018900
2565	PAK00140	PACKING TUMPUK 27	100.0000	PAK00071	PAKU 1 3/4"	2.5926	SUPP	0	Active	5	SUPP	kg	38.571300
2566	PAK00140	PACKING TUMPUK 27	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0488	SUPP	0	Active	6	WADA	m3	2049.180300
2567	PAK00140	PACKING TUMPUK 27	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0313	SUPP	0	Active	7	WADA	m3	3194.888200
2568	PAK00140	PACKING TUMPUK 27	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0125	SUPP	0	Active	8	WADA	m3	8000.000000
2569	PAK00140	PACKING TUMPUK 27	100.0000	PAK00008	GRIPPER, BC 4.0	14.8148	SUPP	0	Active	9	SUPP	pcs	6.750000
2570	PAK00141	PACKING TUMPUK SEPATU 27	100.0000	PAK00006	KARTON, BC 4.0	14.8148	SUPP	0	Active	0	SUPP	kg	6.750000
2571	PAK00141	PACKING TUMPUK SEPATU 27	100.0000	PAK00002	LAKBAN, BC 4.0	44.4444	SUPP	0	Active	1	SUPP	mtr	2.250000
2572	PAK00141	PACKING TUMPUK SEPATU 27	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.8519	SUPP	0	Active	2	SUPP	kg	53.998600
2573	PAK00141	PACKING TUMPUK SEPATU 27	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	1.2963	SUPP	0	Active	3	SUPP	kg	77.142600
2574	PAK00141	PACKING TUMPUK SEPATU 27	100.0000	PAK00007	STRAPPING BAND, BC 4.0	98.1481	SUPP	0	Active	4	SUPP	mtr	1.018900
2575	PAK00141	PACKING TUMPUK SEPATU 27	100.0000	PAK00071	PAKU 1 3/4"	7.2593	SUPP	0	Active	5	SUPP	kg	13.775400
2576	PAK00141	PACKING TUMPUK SEPATU 27	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0585	SUPP	0	Active	6	WADA	m3	1709.401700
2577	PAK00141	PACKING TUMPUK SEPATU 27	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.025	SUPP	0	Active	7	WADA	m3	4000.000000
2578	PAK00141	PACKING TUMPUK SEPATU 27	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0626	SUPP	0	Active	8	WADA	m3	1597.444100
2579	PAK00141	PACKING TUMPUK SEPATU 27	100.0000	PAK00008	GRIPPER, BC 4.0	14.8148	SUPP	0	Active	9	SUPP	pcs	6.750000
2580	PAK00142	PACKING TUMPUK 3x7 DC 27	100.0000	PAK00006	KARTON, BC 4.0	11.1111	SUPP	0	Active	0	SUPP	kg	9.000000
2581	PAK00142	PACKING TUMPUK 3x7 DC 27	100.0000	PAK00002	LAKBAN, BC 4.0	37.037	SUPP	0	Active	1	SUPP	mtr	2.700000
2582	PAK00142	PACKING TUMPUK 3x7 DC 27	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.6667	SUPP	0	Active	2	SUPP	kg	59.998800
2583	PAK00142	PACKING TUMPUK 3x7 DC 27	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	1.2963	SUPP	0	Active	3	SUPP	kg	77.142600
2584	PAK00142	PACKING TUMPUK 3x7 DC 27	100.0000	PAK00007	STRAPPING BAND, BC 4.0	60.7407	SUPP	0	Active	4	SUPP	mtr	1.646300
2585	PAK00142	PACKING TUMPUK 3x7 DC 27	100.0000	PAK00071	PAKU 1 3/4"	2.2222	SUPP	0	Active	5	SUPP	kg	45.000500
2586	PAK00142	PACKING TUMPUK 3x7 DC 27	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0488	SUPP	0	Active	6	WADA	m3	2049.180300
2587	PAK00142	PACKING TUMPUK 3x7 DC 27	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.025	SUPP	0	Active	7	WADA	m3	4000.000000
2588	PAK00142	PACKING TUMPUK 3x7 DC 27	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0094	SUPP	0	Active	8	WADA	m3	10638.297900
2589	PAK00142	PACKING TUMPUK 3x7 DC 27	100.0000	PAK00008	GRIPPER, BC 4.0	14.8148	SUPP	0	Active	9	SUPP	pcs	6.750000
2590	PAK00143	PACKING TUMPUK 3x7 SEPATU DC 27	100.0000	PAK00006	KARTON, BC 4.0	11.1111	SUPP	0	Active	0	SUPP	kg	9.000000
2591	PAK00143	PACKING TUMPUK 3x7 SEPATU DC 27	100.0000	PAK00002	LAKBAN, BC 4.0	37.037	SUPP	0	Active	1	SUPP	mtr	2.700000
2592	PAK00143	PACKING TUMPUK 3x7 SEPATU DC 27	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.6667	SUPP	0	Active	2	SUPP	kg	59.998800
2593	PAK00143	PACKING TUMPUK 3x7 SEPATU DC 27	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	1.2963	SUPP	0	Active	3	SUPP	kg	77.142600
2594	PAK00143	PACKING TUMPUK 3x7 SEPATU DC 27	100.0000	PAK00007	STRAPPING BAND, BC 4.0	60.7407	SUPP	0	Active	4	SUPP	mtr	1.646300
2595	PAK00143	PACKING TUMPUK 3x7 SEPATU DC 27	100.0000	PAK00071	PAKU 1 3/4"	7.2593	SUPP	0	Active	5	SUPP	kg	13.775400
2596	PAK00143	PACKING TUMPUK 3x7 SEPATU DC 27	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0585	SUPP	0	Active	6	WADA	m3	1709.401700
2597	PAK00143	PACKING TUMPUK 3x7 SEPATU DC 27	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.025	SUPP	0	Active	7	WADA	m3	4000.000000
2598	PAK00143	PACKING TUMPUK 3x7 SEPATU DC 27	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0532	SUPP	0	Active	8	WADA	m3	1879.699200
2599	PAK00143	PACKING TUMPUK 3x7 SEPATU DC 27	100.0000	PAK00008	GRIPPER, BC 4.0	14.8148	SUPP	0	Active	9	SUPP	pcs	6.750000
2600	PAK00144	PACKING MIRING 70	100.0000	PAK00006	KARTON, BC 4.0	5.7143	SUPP	0	Active	0	SUPP	kg	17.500000
2601	PAK00144	PACKING MIRING 70	100.0000	PAK00002	LAKBAN, BC 4.0	17.1429	SUPP	0	Active	1	SUPP	mtr	5.833300
2602	PAK00144	PACKING MIRING 70	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.7143	SUPP	0	Active	2	SUPP	kg	139.997200
2603	PAK00144	PACKING MIRING 70	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	1	SUPP	0	Active	3	SUPP	kg	100.000000
2604	PAK00144	PACKING MIRING 70	100.0000	PAK00007	STRAPPING BAND, BC 4.0	37.8571	SUPP	0	Active	4	SUPP	mtr	2.641500
2605	PAK00144	PACKING MIRING 70	100.0000	PAK00071	PAKU 1 3/4"	3.8	SUPP	0	Active	5	SUPP	kg	26.315800
2606	PAK00144	PACKING MIRING 70	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0564	SUPP	0	Active	6	WADA	m3	1773.049600
2607	PAK00144	PACKING MIRING 70	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0217	SUPP	0	Active	7	WADA	m3	4608.294900
2608	PAK00144	PACKING MIRING 70	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0543	SUPP	0	Active	8	WADA	m3	1841.620600
2609	PAK00144	PACKING MIRING 70	100.0000	PAK00008	GRIPPER, BC 4.0	22.8571	SUPP	0	Active	9	SUPP	pcs	4.375000
2610	PAK00145	PACKING MIRING 52	100.0000	PAK00006	KARTON, BC 4.0	7.6923	SUPP	0	Active	0	SUPP	kg	13.000000
2611	PAK00145	PACKING MIRING 52	100.0000	PAK00002	LAKBAN, BC 4.0	23.0769	SUPP	0	Active	1	SUPP	mtr	4.333300
2612	PAK00145	PACKING MIRING 52	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.9615	SUPP	0	Active	2	SUPP	kg	104.004200
2613	PAK00145	PACKING MIRING 52	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	1.3462	SUPP	0	Active	3	SUPP	kg	74.283200
2614	PAK00145	PACKING MIRING 52	100.0000	PAK00007	STRAPPING BAND, BC 4.0	50.9615	SUPP	0	Active	4	SUPP	mtr	1.962300
2615	PAK00145	PACKING MIRING 52	100.0000	PAK00071	PAKU 1 3/4"	5.1154	SUPP	0	Active	5	SUPP	kg	19.548800
2616	PAK00145	PACKING MIRING 52	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0759	SUPP	0	Active	6	WADA	m3	1317.523100
2617	PAK00145	PACKING MIRING 52	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0293	SUPP	0	Active	7	WADA	m3	3412.969300
2618	PAK00145	PACKING MIRING 52	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0731	SUPP	0	Active	8	WADA	m3	1367.989100
2619	PAK00145	PACKING MIRING 52	100.0000	PAK00008	GRIPPER, BC 4.0	30.7692	SUPP	0	Active	9	SUPP	pcs	3.250000
2620	PAK00146	PACKING MIRING 32	100.0000	PAK00006	KARTON, BC 4.0	12.5	SUPP	0	Active	0	SUPP	kg	8.000000
2621	PAK00146	PACKING MIRING 32	100.0000	PAK00002	LAKBAN, BC 4.0	37.5	SUPP	0	Active	1	SUPP	mtr	2.666700
2622	PAK00146	PACKING MIRING 32	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	1.5625	SUPP	0	Active	2	SUPP	kg	64.000000
2623	PAK00146	PACKING MIRING 32	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	2.1875	SUPP	0	Active	3	SUPP	kg	45.714300
2624	PAK00146	PACKING MIRING 32	100.0000	PAK00007	STRAPPING BAND, BC 4.0	82.8125	SUPP	0	Active	4	SUPP	mtr	1.207500
2625	PAK00146	PACKING MIRING 32	100.0000	PAK00071	PAKU 1 3/4"	8.3125	SUPP	0	Active	5	SUPP	kg	12.030100
2626	PAK00146	PACKING MIRING 32	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.1234	SUPP	0	Active	6	WADA	m3	810.372800
2627	PAK00146	PACKING MIRING 32	100.0000	RMK00093	ALBASIA FALCATA PAPAN 13x50x2500	0.0475	SUPP	0	Active	7	WADA	m3	2105.263200
2628	PAK00146	PACKING MIRING 32	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.1188	SUPP	0	Active	8	WADA	m3	841.750800
2629	PAK00146	PACKING MIRING 32	100.0000	PAK00008	GRIPPER, BC 4.0	50	SUPP	0	Active	9	SUPP	pcs	2.000000
2630	PAK00147	PACKING PNC 122	100.0000	PAK00002	LAKBAN, BC 4.0	8.1967	SUPP	0	Active	0	SUPP	mtr	12.200000
2631	PAK00147	PACKING PNC 122	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.3279	SUPP	0	Active	1	SUPP	kg	304.971000
2632	PAK00147	PACKING PNC 122	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.1311	SUPP	0	Active	2	SUPP	kg	762.776500
2633	PAK00147	PACKING PNC 122	100.0000	PAK00007	STRAPPING BAND, BC 4.0	8.6885	SUPP	0	Active	3	SUPP	mtr	11.509500
2634	PAK00147	PACKING PNC 122	100.0000	PAK00071	PAKU 1 3/4"	0.3443	SUPP	0	Active	4	SUPP	kg	290.444400
2635	PAK00147	PACKING PNC 122	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0237	SUPP	0	Active	5	WADA	m3	4219.409300
2636	PAK00147	PACKING PNC 122	100.0000	RMK00012	ALBASIA FALCATA KASO 45x50x1300	0.0159	SUPP	0	Active	6	WADA	m3	6289.308200
2637	PAK00147	PACKING PNC 122	100.0000	PAK00008	GRIPPER, BC 4.0	1.6393	SUPP	0	Active	7	SUPP	pcs	61.001600
2638	PAK00149	PACKING LVL CMD	100.0000	PAK00002	LAKBAN, BC 4.0	8.1967	GKPP	0	Active	0	GKPP	mtr	12.200000
2639	PAK00149	PACKING LVL CMD	100.0000	PAK00003	PLASTIK PE 0.6, BC 4.0	0.3279	GKPP	0	Active	1	GKPP	kg	304.971000
2640	PAK00149	PACKING LVL CMD	100.0000	PAK00004	PLASTIK SIKU, BC 4.0	0.1311	GKPP	0	Active	2	GKPP	kg	762.776500
2641	PAK00149	PACKING LVL CMD	100.0000	PAK00007	STRAPPING BAND, BC 4.0	8.6885	GKPP	0	Active	3	GKPP	mtr	11.509500
2642	PAK00149	PACKING LVL CMD	100.0000	PAK00071	PAKU 1 3/4"	0.3443	GKPP	0	Active	4	GKPP	kg	290.444400
2643	PAK00149	PACKING LVL CMD	100.0000	RMK00039	ALBASIA FALCATA KASO 50x50x1000	0.0237	GKPP	0	Active	5	WADA	m3	4219.409300
2644	PAK00149	PACKING LVL CMD	100.0000	RMK00095	ALBASIA FALCATA PAPAN 13x60x1300	0.0159	GKPP	0	Active	6	WADA	m3	6289.308200
2645	PAK00149	PACKING LVL CMD	100.0000	PAK00008	GRIPPER, BC 4.0	1.6393	GKPP	0	Active	7	GKPP	pcs	61.001600
2646	PAK00149	PACKING LVL CMD	100.0000	PAK00148	KARTON SINGLE FACE WHITE CRAFT 1000x2480	0.0417	GKPP	0	Active	8	GKPP	pcs	2398.081500
2647	SUP00079	PREMIX UL MRE-0	96.5500	SUP00002	LEM UL 172, BC 4.0	55	GKOP	0	Active	0	SUPP	kg	1.755500
2648	SUP00079	PREMIX UL MRE-0	96.5500	SUP00004	TEPUNG INDUSTRI, BC 4.0	17	GKOP	0	Active	1	SUPP	kg	5.679400
2649	SUP00079	PREMIX UL MRE-0	96.5500	SUP00012	TEPUNG POLLARD, BC 4.0	1	GKOP	0	Active	2	SUPP	kg	96.550000
2650	SUP00079	PREMIX UL MRE-0	96.5500	SUP00003	HARDENER (H-2), BC 4.0	0.7	GKOP	0	Active	3	SUPP	kg	137.928600
2651	SUP00079	PREMIX UL MRE-0	96.5500	SUP00027	H-3, BC 4.0	1.1	GKOP	0	Active	4	SUPP	kg	87.772700
2652	SUP00079	PREMIX UL MRE-0	96.5500	SUP00026	MELAMINE, BC 4.0	14	GKOP	0	Active	5	SUPP	kg	6.896400
2653	SUP00079	PREMIX UL MRE-0	96.5500	SUP00025	CATCHER / UREA, BC 4.0	7.75	GKOP	0	Active	6	SUPP	kg	12.458100
2654	SUP00080	PREMIX UL F*4	73.2500	SUP00002	LEM UL 172, BC 4.0	25	GKOP	0	Active	0	SUPP	kg	2.930000
2655	SUP00080	PREMIX UL F*4	73.2500	SUP00026	MELAMINE, BC 4.0	25	GKOP	0	Active	1	SUPP	kg	2.930000
2656	SUP00080	PREMIX UL F*4	73.2500	SUP00003	HARDENER (H-2), BC 4.0	0.5	GKOP	0	Active	2	SUPP	kg	146.500000
2657	SUP00080	PREMIX UL F*4	73.2500	SUP00027	H-3, BC 4.0	1.25	GKOP	0	Active	3	SUPP	kg	58.600000
2658	SUP00080	PREMIX UL F*4	73.2500	SUP00025	CATCHER / UREA, BC 4.0	9	GKOP	0	Active	4	SUPP	kg	8.138900
2659	SUP00080	PREMIX UL F*4	73.2500	SUP00004	TEPUNG INDUSTRI, BC 4.0	12.5	GKOP	0	Active	5	SUPP	kg	5.860000
2660	SUP00085	PREMIX INTAN	106.5000	SUP00081	LEM UL (MBP-UF 1005 B)	64	GKOP	0	Active	0	SUPP	kg	1.664100
2661	SUP00085	PREMIX INTAN	106.5000	SUP00082	MELAMINE (MBP-M 125)	16	GKOP	0	Active	1	SUPP	kg	6.656300
2662	SUP00085	PREMIX INTAN	106.5000	SUP00025	CATCHER / UREA, BC 4.0	10.8	GKOP	0	Active	2	SUPP	kg	9.861100
2663	SUP00085	PREMIX INTAN	106.5000	SUP00083	HARDENER (HD-PIW 230)	2.4	GKOP	0	Active	3	SUPP	kg	44.375000
2664	SUP00085	PREMIX INTAN	106.5000	SUP00084	HARDENER (HD-MBP 250)	0.8	GKOP	0	Active	4	SUPP	kg	133.125000
2665	SUP00085	PREMIX INTAN	106.5000	SUP00004	TEPUNG INDUSTRI, BC 4.0	12.5	GKOP	0	Active	5	SUPP	kg	8.520000
2666	SUP00099	PREMIX MRE-0 1020	94.5500	SUP00002	LEM UL 172, BC 4.0	55	SUPP	0	Active	0	SUPP	kg	1.719100
2667	SUP00099	PREMIX MRE-0 1020	94.5500	SUP00004	TEPUNG INDUSTRI, BC 4.0	7.3	SUPP	0	Active	1	SUPP	kg	12.952100
2668	SUP00099	PREMIX MRE-0 1020	94.5500	SUP00012	TEPUNG POLLARD, BC 4.0	1	SUPP	0	Active	2	SUPP	kg	94.550000
2669	SUP00099	PREMIX MRE-0 1020	94.5500	SUP00098	TEPUNG TAPIOKA, BC 4.0	8	SUPP	0	Active	3	SUPP	kg	11.818800
2670	SUP00099	PREMIX MRE-0 1020	94.5500	SUP00003	HARDENER (H-2), BC 4.0	0.7	SUPP	0	Active	4	SUPP	kg	135.071400
2671	SUP00099	PREMIX MRE-0 1020	94.5500	SUP00027	H-3, BC 4.0	0.8	SUPP	0	Active	5	SUPP	kg	118.187500
2672	SUP00099	PREMIX MRE-0 1020	94.5500	SUP00025	CATCHER / UREA, BC 4.0	7.75	SUPP	0	Active	6	SUPP	kg	12.200000
2673	SUP00099	PREMIX MRE-0 1020	94.5500	SUP00026	MELAMINE, BC 4.0	14	SUPP	0	Active	7	SUPP	kg	6.753600
2674	WCB00001	CORE BLOCKBOARD MRE 13x1220x2440	3.8698	WIV00015	VENEER SG 2x1220x2440	1.1908	WIPA	100	Active	0	GKOP	m3	3.249700
2675	WCB00001	CORE BLOCKBOARD MRE 13x1220x2440	3.8698	RMF00106	FINGER JOINT 11x1220x2500	3.355	WIPA	100	Active	1	GKOP	m3	1.153400
2676	WCB00001	CORE BLOCKBOARD MRE 13x1220x2440	3.8698	SUP00099	PREMIX MRE-0 1020	120	WIPA	100	Active	2	GKOP	Kg	0.032200
2677	WCB00002	CORE BLOCKBOARD MRE 16x1220x2440	4.7629	WIV00011	VENEER SG 2x1220x1220	0.5954	WIPA	100	Active	0	GKOP	m3	7.999500
2678	WCB00002	CORE BLOCKBOARD MRE 16x1220x2440	4.7629	RMB00114	ALBASIA FALCATA BARECORE B 13x1220x2440	3.8698	WIPA	100	Active	1	GKOP	m3	1.230800
2679	WCB00002	CORE BLOCKBOARD MRE 16x1220x2440	4.7629	SUP00073	PREMIX UL MRE-1	110	WIPA	100	Active	2	GKOP	Kg	0.043300
2680	WCB00003	CORE BLOCKBOARD 20x1220x2440	5.9536	RMB00030	ALBASIA FALCATA BARECORE 18.7x1220x2440	5.5666	WIPA	100	Active	0	WADA	m3	1.069500
2681	WCB00003	CORE BLOCKBOARD 20x1220x2440	5.9536	WIV00015	VENEER SG 2x1220x2440	1.1908	WIPA	100	Active	1	WIVE	m3	4.999700
2682	WCB00003	CORE BLOCKBOARD 20x1220x2440	5.9536	SUP00073	PREMIX UL	100	WIPA	100	Active	2	SUPP	Kg	0.059500
2683	WCB00004	CORE BLOCKBOARD MRE 23x1220x2440	6.8466	WIV00190	VENEER JOINT 2x1220x1220	1.1908	WIPA	100	Active	0	GKOP	m3	5.749600
2684	WCB00004	CORE BLOCKBOARD MRE 23x1220x2440	6.8466	RMB00135	ALBASIA FALCATA BARECORE B 21x1220x2440	6.2513	WIPA	100	Active	1	GKOP	m3	1.095200
2685	WCB00004	CORE BLOCKBOARD MRE 23x1220x2440	6.8466	SUP00073	PREMIX UL MRE-1	120	WIPA	100	Active	2	GKOP	Kg	0.057100
2686	WCB00005	CORE BLOCKBOARD 22x1220x2440	6.5490	RMF00010	FINGER JOINT 20x1220x2440	1	WIPA	100	Active	0	WADA	m3	6.549000
2687	WCB00005	CORE BLOCKBOARD 22x1220x2440	6.5490	WIV00070	VENEER LG 2x1220x2440	1	WIPA	100	Active	1	WIVE	m3	6.549000
2688	WCB00005	CORE BLOCKBOARD 22x1220x2440	6.5490	SUP00075	PREMIX BONDTITE	2	WIPA	100	Active	2	SUPP	Kg	3.274500
2689	WCB00006	CORE BLOCKBOARD 16.2x1220x2500	4.9410	RMF00039	FINGER JOINT 12x1220x2500	3.66	WIPA	100	Active	0	WADA	m3	1.350000
2690	WCB00006	CORE BLOCKBOARD 16.2x1220x2500	4.9410	WIV00032	VENEER SG 2.6x1220x2440	1	WIPA	100	Active	1	WIVE	m3	4.941000
2691	WCB00006	CORE BLOCKBOARD 16.2x1220x2500	4.9410	SUP00075	PREMIX BONDTITE	99	WIPA	100	Active	2	SUPP	Kg	0.049900
2692	WCB00007	CORE BLOCKBOARD MRE 10x1220x2500	3.0500	RMF00038	FINGER JOINT 9x1220x2500	2.745	WIPA	100	Active	0	GKOP	m3	1.111100
2693	WCB00007	CORE BLOCKBOARD MRE 10x1220x2500	3.0500	WIV00005	VENEER SG 1.3x1220x2440	0.774	WIPA	100	Active	1	GKOP	m3	3.940600
2694	WCB00007	CORE BLOCKBOARD MRE 10x1220x2500	3.0500	SUP00075	PREMIX BONDTITE	99	WIPA	100	Active	2	GKOP	Kg	0.030800
2695	WCB00008	CORE BLOCKBOARD 10.5x1245x2464	3.2211	WIV00015	VENEER SG 2x1220x2440	1.1908	WIPA	100	Active	0	WIVE	m3	2.705000
2696	WCB00008	CORE BLOCKBOARD 10.5x1245x2464	3.2211	RMF00045	FINGER JOINT 8x1245x2464	2.4541	WIPA	100	Active	1	WADA	m3	1.312500
2697	WCB00008	CORE BLOCKBOARD 10.5x1245x2464	3.2211	SUP00075	PREMIX BONDTITE	99	WIPA	100	Active	2	GKOP	Kg	0.032500
2698	WCB00009	CORE BLOCKBOARD 16.5x1245x2464	5.0617	WIV00035	VENEER SG 3x1220x2440	1.786	WIPA	100	Active	0	WIVE	m3	2.834100
2699	WCB00009	CORE BLOCKBOARD 16.5x1245x2464	5.0617	RMF00046	FINGER JOINT 11.5x1245x2464	3.5278	WIPA	100	Active	1	WADA	m3	1.434800
2700	WCB00009	CORE BLOCKBOARD 16.5x1245x2464	5.0617	SUP00075	PREMIX BONDTITE	99	WIPA	100	Active	2	SUPP	Kg	0.051100
2701	WCB00010	CORE BLOCKBOARD MRE 13x1220x2135	3.3861	WIV00308	VENEER JOINT 2x1220x2200	1.0736	WIPA	100	Active	0	GKOP	m3	3.154000
2702	WCB00010	CORE BLOCKBOARD MRE 13x1220x2135	3.3861	RMB00133	ALBASIA FALCATA BARECORE A 11x1220x2134	2.8638	WIPA	100	Active	1	GKOP	m3	1.182400
2703	WCB00010	CORE BLOCKBOARD MRE 13x1220x2135	3.3861	SUP00099	PREMIX MRE-0 1020	120	WIPA	100	Active	2	GKOP	Kg	0.028200
2704	WCB00019	CORE BLOCKBOARD MRE 10x1220x2440	2.9768	WIV00434	VENEER SG 1.7x1220x2440	1.0122	WIPA	100	Active	0	GKOP	m3	2.940900
2705	WCB00019	CORE BLOCKBOARD MRE 10x1220x2440	2.9768	RMF00105	FINGER JOINT 8x1220x2500	2.44	WIPA	100	Active	1	GKOP	m3	1.220000
2706	WCB00019	CORE BLOCKBOARD MRE 10x1220x2440	2.9768	SUP00099	PREMIX MRE-0 1020	120	WIPA	100	Active	2	GKOP	Kg	0.024800
2707	WCB00020	CORE BLOCKBOARD FJLC MRE 16x1220x2500	4.8800	WIV00015	VENEER SG 2x1220x2440	1.1908	WIPA	100	Active	0	GKOP	m3	4.098100
2708	WCB00020	CORE BLOCKBOARD FJLC MRE 16x1220x2500	4.8800	RMF00101	FINGER JOINT 14x1220x2500	4.27	WIPA	100	Active	1	GKOP	m3	1.142900
2709	WCB00020	CORE BLOCKBOARD FJLC MRE 16x1220x2500	4.8800	SUP00099	PREMIX MRE-0 1020	120	WIPA	100	Active	2	GKOP	Kg	0.040700
2710	WCB00021	CORE BLOCKBOARD FJLC MRE 37x1245x2200	10.1343	WIV00014	VENEER SG 2x1220x2300	1.6836	WIPA	100	Active	0	GKOP	m3	6.019400
2711	WCB00021	CORE BLOCKBOARD FJLC MRE 37x1245x2200	10.1343	FGF00060	ALBASIA FALCATA FINGER JOINT 16.3x1245x2200	8.9292	WIPA	100	Active	1	PFIN	m3	1.135000
2712	WCB00021	CORE BLOCKBOARD FJLC MRE 37x1245x2200	10.1343	SUP00099	PREMIX MRE-0 1020	205	WIPA	100	Active	2	GKOP	Kg	0.049400
2713	WCB00022	CORE BLOCKBOARD FJLC MRE 16x1245x2500	4.9800	WIV00011	VENEER SG 2x1220x1220	1.1908	WIPA	100	Active	0	GKOP	m3	4.182100
2714	WCB00022	CORE BLOCKBOARD FJLC MRE 16x1245x2500	4.9800	FGF00065	FINGER JOINT BBP 14x1245x2500	4.3575	WIPA	100	Active	1	PFIN	m3	1.142900
2715	WCB00022	CORE BLOCKBOARD FJLC MRE 16x1245x2500	4.9800	SUP00099	PREMIX MRE-0 1020	120	WIPA	100	Active	2	GKOP	Kg	0.041500
2716	WCD00001	CORE DOORCORE MRE 26x1220x2440	7.7397	WIV00015	VENEER SG 2x1220x2440	0.5954	WIPA	100	Active	0	GKOP	m3	12.999200
2717	WCD00001	CORE DOORCORE MRE 26x1220x2440	7.7397	RMB00114	ALBASIA FALCATA BARECORE B 13x1220x2440	7.7396	WIPA	100	Active	1	GKOP	m3	1.000000
2718	WCD00001	CORE DOORCORE MRE 26x1220x2440	7.7397	SUP00073	PREMIX UL MRE-1	76.875	WIPA	100	Active	2	GKOP	Kg	0.100700
2719	WCD00002	CORE DOORCORE 30x830x2110	5.2539	RMB00002	ALBASIA FALCATA BARECORE 10.5x1220x2440	9.3768	WIPA	100	Active	0	WADA	m3	0.560300
2720	WCD00002	CORE DOORCORE 30x830x2110	5.2539	SUP00073	PREMIX UL	100	WIPA	100	Active	1	SUPP	Kg	0.052500
2721	WCD00004	CORE DOORCORE 30x930x2400	6.6960	RMB00002	ALBASIA FALCATA BARECORE 10.5x1220x2440	9.3768	WIPA	100	Active	0	WADA	m3	0.714100
2722	WCD00004	CORE DOORCORE 30x930x2400	6.6960	SUP00073	PREMIX UL	100	WIPA	100	Active	1	SUPP	Kg	0.067000
2723	WCD00005	CORE DOORCORE MRE 30x1220x2440	8.9304	RMB00113	ALBASIA FALCATA BARECORE B 10.5x1220x2440	6.2512	WIPA	100	Active	0	GKOP	m3	1.428600
2724	WCD00005	CORE DOORCORE MRE 30x1220x2440	8.9304	RMB00116	ALBASIA FALCATA BARECORE B 10.5 CENTER CORE	3.12564	WIPA	100	Active	1	GKOP	m3	2.857100
2725	WCD00005	CORE DOORCORE MRE 30x1220x2440	8.9304	SUP00073	PREMIX UL MRE-1	102.5	WIPA	100	Active	2	GKOP	Kg	0.087100
2726	WCD00006	CORE DOORCORE MRE 38x905x2095	7.2047	RMB00004	ALBASIA FALCATA BARECORE A 13x905x2095	4.9296	WIPA	100	Active	0	GKOP	m3	1.461500
2727	WCD00006	CORE DOORCORE MRE 38x905x2095	7.2047	RMB00073	ALBASIA FALCATA BARECORE A 13 CENTER CORE	2.7742	WIPA	100	Active	1	GKOP	m3	2.597000
2728	WCD00006	CORE DOORCORE MRE 38x905x2095	7.2047	SUP00073	PREMIX UL MRE-1	151.4045	WIPA	100	Active	2	GKOP	Kg	0.047600
2729	WCD00007	CORE DOORCORE MRE 38x915x2135	7.4234	WIV00008	VENEER SG 2x930x2150	1.1997	WIPA	100	Active	0	GKOP	m3	6.187700
2730	WCD00007	CORE DOORCORE MRE 38x915x2135	7.4234	RMB00127	ALBASIA FALCATA BARECORE A 16.8x915x2135	6.5638	WIPA	100	Active	1	GKOP	m3	1.131000
2731	WCD00007	CORE DOORCORE MRE 38x915x2135	7.4234	SUP00073	PREMIX UL MRE-1	165	WIPA	100	Active	2	GKOP	Kg	0.045000
2732	WCD00008	CORE DOORCORE MRE 42x762x1981	6.3400	WIV00008	VENEER SG 2x930x2150	1.1997	WIPA	100	Active	0	WIVE	m3	5.284700
2733	WCD00008	CORE DOORCORE MRE 42x762x1981	6.3400	RMB00026	ALBASIA FALCATA BARECORE A 18.7x762x1981	5.6456	WIPA	100	Active	1	GKOP	m3	1.123000
2734	WCD00008	CORE DOORCORE MRE 42x762x1981	6.3400	SUP00073	PREMIX UL MRE-1	232.2682	WIPA	100	Active	2	GKOP	Kg	0.027300
2735	WCD00011	CORE DOORCORE MRE 42x1220x2440	12.5026	WIV00011	VENEER SG 2x1220x1220	1.7862	WIPA	100	Active	0	WIVE	m3	6.999600
2736	WCD00011	CORE DOORCORE MRE 42x1220x2440	12.5026	RMB00030	ALBASIA FALCATA BARECORE A 18.7x1220x2440	11.1332	WIPA	100	Active	1	WADA	m3	1.123000
2737	WCD00011	CORE DOORCORE MRE 42x1220x2440	12.5026	SUP00073	PREMIX UL MRE-1	240	WIPA	100	Active	2	GKOP	Kg	0.052100
2738	WCD00012	CORE DOORCORE 37x1220x2200	7.4234	RMB00018	ALBASIA FALCATA BARECORE 16x1220x2440	9.5258	WIPA	100	Active	0	WADA	m3	0.779300
2739	WCD00012	CORE DOORCORE 37x1220x2200	7.4234	SUP00073	PREMIX UL	100	WIPA	100	Active	1	SUPP	Kg	0.074200
2740	WCD00012	CORE DOORCORE 37x1220x2200	7.4234	WIV00011	VENEER SG 2x1220x1220	1.7862	WIPA	100	Active	5	WIVE	m3	4.156000
2741	WCD00013	CORE DOORCORE 40x900x2100	7.5600	RMB00004	ALBASIA FALCATA BARECORE 13x905x2095	4.9296	WIPA	100	Active	0	WADA	m3	1.533600
2742	WCD00013	CORE DOORCORE 40x900x2100	7.5600	RMB00002	ALBASIA FALCATA BARECORE 10.5x1220x2440	2.1879	WIPA	100	Active	1	WADA	m3	3.455400
2743	WCD00013	CORE DOORCORE 40x900x2100	7.5600	WIV00023	VENEER SG 2.6x930x2150	1.0398	WIPA	100	Active	2	WIVE	m3	7.270600
2744	WCD00013	CORE DOORCORE 40x900x2100	7.5600	SUP00079	PREMIX UL MRE-0	102.5	WIPA	100	Active	3	SUPP	Kg	0.073800
2745	WCD00015	CORE DOORCORE MRE 42x920x2150	8.3076	WIV00008	VENEER SG 2x930x2150	0.7998	WIPA	100	Active	0	GKOP	m3	10.387100
2746	WCD00015	CORE DOORCORE MRE 42x920x2150	8.3076	RMB00005	ALBASIA FALCATA BARECORE B 13x915x2135	5.0792	WIPA	100	Active	1	WADA	m3	1.635600
2747	WCD00015	CORE DOORCORE MRE 42x920x2150	8.3076	RMB00117	ALBASIA FALCATA BARECORE B 13 CENTER CORE	2.5714	WIPA	100	Active	2	WADA	m3	3.230800
2748	WCD00015	CORE DOORCORE MRE 42x920x2150	8.3076	SUP00073	PREMIX UL MRE-1	205	WIPA	100	Active	3	GKOP	Kg	0.040500
2749	WCD00016	CORE DOORCORE 42x820x2150	7.3529	RMB00003	ALBASIA FALCATA BARECORE 13x820x2135	6.8277	WIPA	100	Active	0	WADA	m3	1.076900
2750	WCD00016	CORE DOORCORE 42x820x2150	7.3529	WIV00008	VENEER SG 2x930x2150	0.7998	WIPA	100	Active	1	WIVE	m3	9.193400
2751	WCD00016	CORE DOORCORE 42x820x2150	7.3529	SUP00073	PREMIX UL	200	WIPA	100	Active	2	SUPP	Kg	0.036800
2752	WCD00017	CORE DOORCORE 39.5x1232x2451	11.9275	RMB00036	ALBASIA FALCATA BARECORE 17.7x1232x2451	10.6894	WIPA	100	Active	0	WADA	m3	1.115800
2753	WCD00017	CORE DOORCORE 39.5x1232x2451	11.9275	WIV00015	VENEER SG 2x1220x2440	1.1908	WIPA	100	Active	1	WIVE	m3	10.016400
2754	WCD00017	CORE DOORCORE 39.5x1232x2451	11.9275	SUP00075	PREMIX BONDTITE	210.8	WIPA	100	Active	2	SUPP	Kg	0.056600
2755	WCD00017	CORE DOORCORE 39.5x1232x2451	11.9275	WIV00032	VENEER SG 2.6x1220x2440	0.774	WIPA	100	Active	6	WIVE	m3	15.410200
2756	WCD00018	CORE DOORCORE 36x1220x2440	10.7165	RMB00037	ALBASIA FALCATA BARECORE 10.5x1232x2451	6.3412	WIPA	100	Active	0	WADA	m3	1.690000
2757	WCD00018	CORE DOORCORE 36x1220x2440	10.7165	RMB00038	ALBASIA FALCATA BARECORE 13x1232x2451	3.9255	WIPA	100	Active	1	WADA	m3	2.730000
2758	WCD00018	CORE DOORCORE 36x1220x2440	10.7165	WIV00015	VENEER SG 2x1220x2440	1.1908	WIPA	100	Active	2	WIVE	m3	8.999400
2759	WCD00018	CORE DOORCORE 36x1220x2440	10.7165	SUP00075	PREMIX BONDTITE	105.4	WIPA	100	Active	3	SUPP	Kg	0.101700
2760	WCD00021	CORE DOORCORE 37x900x2100	6.9930	RMB00043	ALBASIA FALCATA BARECORE 10.5x900x2050	3.8746	WIPA	100	Active	0	WADA	m3	1.804800
2761	WCD00021	CORE DOORCORE 37x900x2100	6.9930	RMB00009	ALBASIA FALCATA BARECORE 13x1220x2440	2.3464	WIPA	100	Active	1	WADA	m3	2.980300
2762	WCD00021	CORE DOORCORE 37x900x2100	6.9930	WIV00023	VENEER SG 2.6x930x2150	1.0398	WIPA	100	Active	2	WIVE	m3	6.725300
2763	WCD00021	CORE DOORCORE 37x900x2100	6.9930	SUP00079	PREMIX UL MRE-0	102.5	WIPA	100	Active	3	SUPP	Kg	0.068200
2764	WCD00022	CORE DOORCORE 42x720x2150	6.5016	RMB00009	ALBASIA FALCATA BARECORE 13x1220x2440	3.8698	WIPA	100	Active	0	WADA	m3	1.680100
2765	WCD00022	CORE DOORCORE 42x720x2150	6.5016	WIV00008	VENEER SG 2x930x2150	0.3999	WIPA	100	Active	1	WIVE	m3	16.258100
2766	WCD00022	CORE DOORCORE 42x720x2150	6.5016	SUP00073	PREMIX UL MRE-1	102.5	WIPA	100	Active	2	SUPP	Kg	0.063400
2767	WCD00023	CORE DOORCORE 37x900x2050	6.8265	RMB00043	ALBASIA FALCATA BARECORE 10.5x900x2050	3.8746	WIPA	100	Active	0	WADA	m3	1.761900
2768	WCD00023	CORE DOORCORE 37x900x2050	6.8265	RMB00009	ALBASIA FALCATA BARECORE 13x1220x2440	2.3464	WIPA	100	Active	1	WADA	m3	2.909400
2769	WCD00023	CORE DOORCORE 37x900x2050	6.8265	WIV00023	VENEER SG 2.6x930x2150	1.0398	WIPA	100	Active	2	WIVE	m3	6.565200
2770	WCD00023	CORE DOORCORE 37x900x2050	6.8265	SUP00079	PREMIX UL MRE-0	102.5	WIPA	100	Active	3	GKOP	Kg	0.066600
2771	WCD00024	CORE DOORCORE 55x822x2280	10.3079	RMB00050	ALBASIA FALCATA BARECORE 17.5x822x2280	6.5596	WIPA	100	Active	0	WADA	m3	1.571400
2772	WCD00024	CORE DOORCORE 55x822x2280	10.3079	RMB00051	ALBASIA FALCATA BARECORE 17.5x1140x1700	3.3915	WIPA	100	Active	1	WADA	m3	3.039300
2773	WCD00024	CORE DOORCORE 55x822x2280	10.3079	WIV00008	VENEER SG 2x930x2150	0.7998	WIPA	100	Active	2	WIVE	m3	12.888100
2774	WCD00024	CORE DOORCORE 55x822x2280	10.3079	SUP00075	PREMIX BONDTITE	99	WIPA	100	Active	3	SUPP	Kg	0.104100
2775	WCD00026	CORE DOORCORE 35x1220x1980	8.4546	RMB00056	ALBASIA FALCATA BARECORE 13x1220x1980	6.2806	WIPA	100	Active	0	WADA	m3	1.346100
2776	WCD00026	CORE DOORCORE 35x1220x1980	8.4546	RMB00002	ALBASIA FALCATA BARECORE 10.5x1220x2440	3.1256	WIPA	100	Active	1	WADA	m3	2.705000
2777	WCD00026	CORE DOORCORE 35x1220x1980	8.4546	SUP00073	PREMIX UL MRE-1	102.5	WIPA	100	Active	2	GKOP	Kg	0.082500
2778	WCD00027	CORE DOORCORE 35x1220x2280	9.7356	RMB00058	ALBASIA FALCATA BARECORE 13x1220x2280	7.2322	WIPA	100	Active	0	WADA	m3	1.346100
2779	WCD00027	CORE DOORCORE 35x1220x2280	9.7356	RMB00059	ALBASIA FALCATA BARECORE 10.5x1140x2440	2.9207	WIPA	100	Active	1	WADA	m3	3.333300
2780	WCD00027	CORE DOORCORE 35x1220x2280	9.7356	SUP00073	PREMIX UL	102.5	WIPA	100	Active	2	GKOP	Kg	0.095000
2781	WCD00028	CORE DOORCORE 38x1220x2135	9.8979	RMB00017	ALBASIA FALCATA BARECORE 16x1220x2200	8.5888	WIPA	100	Active	0	WADA	m3	1.152400
2782	WCD00028	CORE DOORCORE 38x1220x2135	9.8979	WIV00011	VENEER SG 2x1220x1220	1.7862	WIPA	100	Active	1	WIVE	m3	5.541300
2783	WCD00028	CORE DOORCORE 38x1220x2135	9.8979	SUP00079	PREMIX UL MRE-0	205	WIPA	100	Active	2	GKOP	Kg	0.048300
2784	WCD00029	CORE DOORCORE 35.4x1000x2135	7.5579	RMB00016	ALBASIA FALCATA BARECORE 16x1000x2135	6.832	WIPA	100	Active	0	WADA	m3	1.106300
2785	WCD00029	CORE DOORCORE 35.4x1000x2135	7.5579	WIV00281	VENEER SG 2x1220x2200	1.6104	WIPA	100	Active	1	WIVE	m3	4.693200
2786	WCD00029	CORE DOORCORE 35.4x1000x2135	7.5579	SUP00079	PREMIX UL MRE-0	205	WIPA	100	Active	2	GKOP	Kg	0.036900
2787	WCD00031	CORE DOORCORE 26x932x2050	7.7397	RMB00060	ALBASIA FALCATA BARECORE 13x932x2050	4.9676	WIPA	100	Active	0	WADA	m3	1.558000
2788	WCD00031	CORE DOORCORE 26x932x2050	7.7397	SUP00073	PREMIX UL MRE-1	102.5	WIPA	100	Active	1	GKOP	Kg	0.075500
2789	WCD00032	CORE DOORCORE 26x932x2350	7.7397	RMB00061	ALBASIA FALCATA BARECORE 13x932x2350	5.6946	WIPA	100	Active	0	WADA	m3	1.359100
2790	WCD00032	CORE DOORCORE 26x932x2350	7.7397	SUP00073	PREMIX UL MRE-1	102.5	WIPA	100	Active	1	GKOP	Kg	0.075500
2791	WCD00033	CORE DOORCORE 31x932x2050	5.9229	RMB00009	ALBASIA FALCATA BARECORE 13x1220x2440	5.4177	WIPA	100	Active	0	WADA	m3	1.093200
2792	WCD00033	CORE DOORCORE 31x932x2050	5.9229	WIV00008	VENEER SG 2x930x2150	1.1997	WIPA	100	Active	1	WIVE	m3	4.937000
2793	WCD00033	CORE DOORCORE 31x932x2050	5.9229	SUP00073	PREMIX UL MRE-1	102.5	WIPA	100	Active	2	GKOP	Kg	0.057800
2794	WCD00035	CORE DOORCORE 36x932x2350	7.8847	RMB00062	ALBASIA FALCATA BARECORE 16x932x2350	7.0086	WIPA	100	Active	0	WADA	m3	1.125000
2795	WCD00035	CORE DOORCORE 36x932x2350	7.8847	WIV00008	VENEER SG 2x930x2150	1.1997	WIPA	100	Active	1	WIVE	m3	6.572200
2796	WCD00035	CORE DOORCORE 36x932x2350	7.8847	SUP00073	PREMIX UL MRE-1	102.5	WIPA	100	Active	2	GKOP	Kg	0.076900
2797	WCD00037	CORE DOORCORE 35x1220x2440	10.4188	RMB00009	ALBASIA FALCATA BARECORE 13x1220x2440	11.6094	WIPA	100	Active	0	WADA	m3	0.897400
2798	WCD00037	CORE DOORCORE 35x1220x2440	10.4188	SUP00073	PREMIX UL MRE-1	102.5	WIPA	100	Active	1	SUPP	Kg	0.101600
2799	WCD00039	CORE DOORCORE 33x820x2420	6.5485	RMB00002	ALBASIA FALCATA BARECORE 10.5x1220x2440	6.2512	WIPA	100	Active	0	WADA	m3	1.047600
2800	WCD00039	CORE DOORCORE 33x820x2420	6.5485	RMB00009	ALBASIA FALCATA BARECORE 13x1220x2440	3.8698	WIPA	100	Active	1	WADA	m3	1.692200
2801	WCD00039	CORE DOORCORE 33x820x2420	6.5485	SUP00099	PREMIX MRE-0 1020	102.5	WIPA	100	Active	2	GKOP	Kg	0.063900
2802	WCD00040	CORE DOORCORE 33x920x2420	7.3471	RMB00002	ALBASIA FALCATA BARECORE 10.5x1220x2440	6.2512	WIPA	100	Active	0	WADA	m3	1.175300
2803	WCD00040	CORE DOORCORE 33x920x2420	7.3471	RMB00009	ALBASIA FALCATA BARECORE 13x1220x2440	3.8698	WIPA	100	Active	1	WADA	m3	1.898600
2804	WCD00040	CORE DOORCORE 33x920x2420	7.3471	SUP00099	PREMIX MRE-0 1020	102.5	WIPA	100	Active	2	GKOP	Kg	0.071700
2805	WCD00045	CORE DOORCORE 35x932x2340	7.6331	RMB00009	ALBASIA FALCATA BARECORE 13x1220x2440	6.1917	WIPA	100	Active	0	WADA	m3	1.232800
2806	WCD00045	CORE DOORCORE 35x932x2340	7.6331	RMB00002	ALBASIA FALCATA BARECORE 10.5x1220x2440	2.5005	WIPA	100	Active	1	WADA	m3	3.052600
2807	WCD00045	CORE DOORCORE 35x932x2340	7.6331	WIV00372	VENEER SG 2x930x2400	1.3392	WIPA	100	Active	2	WIVE	m3	5.699700
2808	WCD00045	CORE DOORCORE 35x932x2340	7.6331	SUP00073	PREMIX UL MRE-1	102.5	WIPA	100	Active	3	GKOP	Kg	0.074500
2809	WCD00047	CORE DOORCORE MRE 38x1220x2440	11.3118	RMB00009	ALBASIA FALCATA BARECORE A 13x1220x2440	11.6094	WIPA	100	Active	0	GKOP	m3	0.974400
2810	WCD00047	CORE DOORCORE MRE 38x1220x2440	11.3118	SUP00073	PREMIX UL MRE-1	105.9	WIPA	100	Active	1	GKOP	Kg	0.106800
2811	WCD00048	CORE DOORCORE 42x905x2095	7.9631	RMB00009	ALBASIA FALCATA BARECORE 13x1220x2440	2.9024	WIPA	100	Active	0	WADA	m3	2.743600
2812	WCD00048	CORE DOORCORE 42x905x2095	7.9631	RMB00067	ALBASIA FALCATA BARECORE 15.5x905x2095	5.8776	WIPA	100	Active	1	WADA	m3	1.354800
2813	WCD00048	CORE DOORCORE 42x905x2095	7.9631	SUP00073	PREMIX UL MRE-1	102.5	WIPA	100	Active	2	GKOP	Kg	0.077700
2814	WCD00049	CORE DOORCORE MRE 42x838x2058	7.2433	WIV00008	VENEER SG 2x930x2150	1.1997	WIPA	100	Active	0	GKOP	m3	6.037600
2815	WCD00049	CORE DOORCORE MRE 42x838x2058	7.2433	RMB00027	ALBASIA FALCATA BARECORE A 18.7x838x2058	6.45	WIPA	100	Active	1	GKOP	m3	1.123000
2816	WCD00049	CORE DOORCORE MRE 42x838x2058	7.2433	SUP00073	PREMIX UL MRE-1	211.2	WIPA	100	Active	2	GKOP	Kg	0.034300
2817	WCD00050	CORE DOORCORE MRE 42x838x1981	6.9723	RMB00068	ALBASIA FALCATA BARECORE A 18.7x838x1981	6.2086	WIPA	100	Active	0	GKOP	m3	1.123000
2818	WCD00050	CORE DOORCORE MRE 42x838x1981	6.9723	WIV00008	VENEER SG 2x930x2150	1.1997	WIPA	100	Active	1	GKOP	m3	5.811700
2819	WCD00050	CORE DOORCORE MRE 42x838x1981	6.9723	SUP00073	PREMIX UL MRE-1	211.8	WIPA	100	Active	2	GKOP	Kg	0.032900
2820	WCD00051	CORE DOORCORE 34x1220x2440	10.1211	RMB00009	ALBASIA FALCATA BARECORE 13x1220x2440	7.7396	WIPA	100	Active	0	GKOP	m3	1.307700
2821	WCD00051	CORE DOORCORE 34x1220x2440	10.1211	RMB00002	ALBASIA FALCATA BARECORE 10.5x1220x2440	3.1256	WIPA	100	Active	1	GKOP	m3	3.238100
2822	WCD00051	CORE DOORCORE 34x1220x2440	10.1211	SUP00075	PREMIX BONDTITE	99	WIPA	100	Active	2	GKOP	Kg	0.102200
2823	WCD00052	CORE DOORCORE 39.5x1232x2781	13.5335	RMF00042	FINGER JOINT 20x1232x2781	13.7048	WIPA	100	Active	0	GKOP	m3	0.987500
2824	WCD00052	CORE DOORCORE 39.5x1232x2781	13.5335	WIV00385	VENEER SG 2x1220x1400	0.6832	WIPA	100	Active	1	GKOP	m3	19.809000
2825	WCD00052	CORE DOORCORE 39.5x1232x2781	13.5335	SUP00075	PREMIX BONDTITE	210.8	WIPA	100	Active	2	GKOP	Kg	0.064200
2826	WCD00053	CORE DOORCORE MRE 36x932x2050	6.8782	RMB00060	ALBASIA FALCATA BARECORE A 13x932x2050	4.9676	WIPA	100	Active	0	GKOP	m3	1.384600
2827	WCD00053	CORE DOORCORE MRE 36x932x2050	6.8782	RMB00072	ALBASIA FALCATA BARECORE A 10.5 CENTER CORE	2.01	WIPA	100	Active	1	GKOP	m3	3.422000
2828	WCD00053	CORE DOORCORE MRE 36x932x2050	6.8782	SUP00073	PREMIX UL MRE-1	102.5	WIPA	100	Active	2	GKOP	Kg	0.067100
2829	WCD00053	CORE DOORCORE MRE 36x932x2050	6.8782	SUP00005	LEM PROTECTA C-3, BC 23	0.05	WIPA	100	Active	3	SUPP	kg	137.564000
2830	WCD00054	CORE DOORCORE 33x932x2050	6.3050	RMB00060	ALBASIA FALCATA BARECORE 13x932x2050	4.9676	WIPA	100	Active	0	WADA	m3	1.269200
2831	WCD00054	CORE DOORCORE 33x932x2050	6.3050	RMB00002	ALBASIA FALCATA BARECORE 10.5x1220x2440	2.6568	WIPA	100	Active	1	WADA	m3	2.373200
2832	WCD00054	CORE DOORCORE 33x932x2050	6.3050	SUP00073	PREMIX UL MRE-1	1	WIPA	100	Active	2	SUPP	Kg	6.305000
2833	WCD00055	CORE DOORCORE 33x932x2350	7.2277	RMB00060	ALBASIA FALCATA BARECORE 13x932x2050	4.9676	WIPA	100	Active	0	GKOP	m3	1.455000
2834	WCD00055	CORE DOORCORE 33x932x2350	7.2277	RMB00002	ALBASIA FALCATA BARECORE 10.5x1220x2440	2.6568	WIPA	100	Active	1	GKOP	m3	2.720500
2835	WCD00055	CORE DOORCORE 33x932x2350	7.2277	SUP00073	PREMIX UL MRE-1	205	WIPA	100	Active	2	GKOP	Kg	0.035300
2836	WCD00056	CORE DOORCORE 36x700x2000	5.0400	RMB00072	ALBASIA FALCATA BARECORE 10.5 CENTER CORE	1.6863	WIPA	100	Active	0	GKOP	m3	2.988800
2837	WCD00056	CORE DOORCORE 36x700x2000	5.0400	RMB00075	ALBASIA FALCATA BARECORE 13x700x2000	3.64	WIPA	100	Active	1	GKOP	m3	1.384600
2838	WCD00056	CORE DOORCORE 36x700x2000	5.0400	SUP00073	PREMIX UL MRE-1	102.5	WIPA	100	Active	2	GKOP	Kg	0.049200
2839	WCD00058	CORE DOORCORE MRE 27x810x1810	3.9585	RMB00074	ALBASIA FALCATA BARECORE B 13x810x1810	3.8118	WIPA	100	Active	0	GKOP	m3	1.038500
2840	WCD00058	CORE DOORCORE MRE 27x810x1810	3.9585	WIV00008	VENEER SG 2x930x2150	0.3999	WIPA	100	Active	1	GKOP	m3	9.898700
2841	WCD00058	CORE DOORCORE MRE 27x810x1810	3.9585	SUP00073	PREMIX UL MRE-1	132.674	WIPA	100	Active	2	GKOP	Kg	0.029800
2842	WCD00059	CORE DOORCORE 33x830x2110	5.7793	RMB00073	ALBASIA FALCATA BARECORE 13 CENTER CORE	1	WIPA	100	Active	0	WADA	m3	5.779300
2843	WCD00059	CORE DOORCORE 33x830x2110	5.7793	SUP00073	PREMIX UL MRE-1	59	WIPA	100	Active	1	SUPP	Kg	0.098000
2844	WCD00059	CORE DOORCORE 33x830x2110	5.7793	RMB00079	ALBASIA FALCATA BARECORE 10.5x830x2110	3.6778	WIPA	100	Active	2	WADA	m3	1.571400
2845	WCD00060	CORE DOORCORE 28x1050x2200	7.7397	SUP00073	PREMIX UL MRE-1	102.5	WIPA	100	Active	0	GKOP	Kg	0.075500
2846	WCD00060	CORE DOORCORE 28x1050x2200	7.7397	RMB00078	ALBASIA FALCATA BARECORE 10.5x1050x2200	4.851	WIPA	100	Active	1	GKOP	m3	1.595500
2847	WCD00060	CORE DOORCORE 28x1050x2200	7.7397	RMB00072	ALBASIA FALCATA BARECORE 10.5 CENTER CORE	1	WIPA	100	Active	2	GKOP	m3	7.739700
2848	WCD00063	CORE DOORCORE 31x1250x2500	9.6875	WIV00015	VENEER SG 2x1220x2440	1.7862	WIPA	100	Active	0	GKOP	m3	5.423500
2849	WCD00063	CORE DOORCORE 31x1250x2500	9.6875	RMB00085	ALBASIA FALCATA BARECORE 13x1250x2500	8.125	WIPA	100	Active	1	GKOP	m3	1.192300
2850	WCD00063	CORE DOORCORE 31x1250x2500	9.6875	SUP00099	PREMIX MRE-0 1020	102.5	WIPA	100	Active	2	GKOP	Kg	0.094500
2851	WCD00079	CORE DOORCORE MRE 42x915x2058	7.9089	WIV00008	VENEER SG 2x930x2150	1.1997	WIPA	100	Active	0	GKOP	m3	6.592400
2852	WCD00079	CORE DOORCORE MRE 42x915x2058	7.9089	RMB00099	ALBASIA FALCATA BARECORE A 18.7x915x2058	7.0426	WIPA	100	Active	1	GKOP	m3	1.123000
2853	WCD00079	CORE DOORCORE MRE 42x915x2058	7.9089	SUP00073	PREMIX UL MRE-1	205	WIPA	100	Active	2	GKOP	Kg	0.038600
2854	WCD00083	CORE DOORCORE MRE 31x932x2300	6.6452	WIV00372	VENEER SG 2x930x2400	1.3392	WIPA	100	Active	0	GKOP	m3	4.962100
2855	WCD00083	CORE DOORCORE MRE 31x932x2300	6.6452	RMB00106	ALBASIA FALCATA BARECORE A 13x932x2300	5.5734	WIPA	100	Active	1	GKOP	m3	1.192300
2856	WCD00083	CORE DOORCORE MRE 31x932x2300	6.6452	SUP00073	PREMIX UL MRE-1	153.75	WIPA	100	Active	2	GKOP	Kg	0.043200
2857	WCD00083	CORE DOORCORE MRE 31x932x2300	6.6452	SUP00005	LEM PROTECTA C-3, BC 23	0.2	WIPA	100	Active	3	GKOP	kg	33.226000
2858	WCD00084	CORE DOORCORE MRE 36x932x2300	7.7170	RMB00106	ALBASIA FALCATA BARECORE A 13x932x2300	5.5734	WIPA	100	Active	0	GKOP	m3	1.384600
2859	WCD00084	CORE DOORCORE MRE 36x932x2300	7.7170	RMB00072	ALBASIA FALCATA BARECORE A 10.5 CENTER CORE	2.25078	WIPA	100	Active	1	GKOP	m3	3.428600
2860	WCD00084	CORE DOORCORE MRE 36x932x2300	7.7170	SUP00073	PREMIX UL MRE-1	102.5	WIPA	100	Active	2	GKOP	Kg	0.075300
2861	WCD00086	CORE DOORCORE MRE 28x932x2300	6.0021	RMB00106	ALBASIA FALCATA BARECORE A 13x932x2300	5.5734	WIPA	100	Active	0	GKOP	m3	1.076900
2862	WCD00086	CORE DOORCORE MRE 28x932x2300	6.0021	WIV00372	VENEER SG 2x930x2400	0.4464	WIPA	100	Active	1	GKOP	m3	13.445600
2863	WCD00086	CORE DOORCORE MRE 28x932x2300	6.0021	SUP00073	PREMIX UL MRE-1	102.5	WIPA	100	Active	2	GKOP	Kg	0.058600
2864	WCD00086	CORE DOORCORE MRE 28x932x2300	6.0021	SUP00005	LEM PROTECTA C-3, BC 23	0.05	WIPA	100	Active	3	GKOP	kg	120.042000
2865	WCD00089	CORE DOORCORE MRE 33x830x2200	6.0258	RMB00112	ALBASIA FALCATA BARECORE A 10.5x830x2200	3.8346	WIPA	100	Active	0	GKOP	m3	1.571400
2866	WCD00089	CORE DOORCORE MRE 33x830x2200	6.0258	RMB00073	ALBASIA FALCATA BARECORE A 13 CENTER CORE	2.3738	WIPA	100	Active	1	GKOP	m3	2.538500
2867	WCD00089	CORE DOORCORE MRE 33x830x2200	6.0258	SUP00073	PREMIX UL MRE-1	76.875	WIPA	100	Active	2	GKOP	Kg	0.078400
2868	WCD00092	CORE DOORCORE MRE 37.7x1245x2200	10.3260	WIV00011	VENEER SG 2x1220x1220	1.7862	WIPA	100	Active	0	GKOP	m3	5.781000
2869	WCD00092	CORE DOORCORE MRE 37.7x1245x2200	10.3260	RMB00104	ALBASIA FALCATA BARECORE A 16.5x1245x2200	9.0388	WIPA	100	Active	1	GKOP	m3	1.142400
2870	WCD00092	CORE DOORCORE MRE 37.7x1245x2200	10.3260	SUP00073	PREMIX UL MRE-1	153.75	WIPA	100	Active	2	GKOP	Kg	0.067200
2871	WCD00108	CORE DOORCORE MRE 30x920x2150	5.9340	RMB00131	ALBASIA FALCATA BARECORE B 10.5x920x2150	4.1538	WIPA	100	Active	0	GKOP	m3	1.428600
2872	WCD00108	CORE DOORCORE MRE 30x920x2150	5.9340	RMB00155	ALBASIA FALCATA BARECORE C 10.5 CENTER CORE	2.27409	WIPA	100	Active	1	GKOP	m3	2.609400
2873	WCD00108	CORE DOORCORE MRE 30x920x2150	5.9340	SUP00099	PREMIX MRE-0 1020	82.5	WIPA	100	Active	2	GKOP	Kg	0.071900
2874	WCD00109	CORE DOORCORE MRE 26x1100x2400	6.8640	RMB00114	ALBASIA FALCATA BARECORE B 13x1220x2440	7.7396	WIPA	100	Active	0	GKOP	m3	0.886900
2875	WCD00109	CORE DOORCORE MRE 26x1100x2400	6.8640	WIV00011	VENEER SG 2x1220x1220	0.5954	WIPA	100	Active	1	GKOP	m3	11.528400
2876	WCD00109	CORE DOORCORE MRE 26x1100x2400	6.8640	SUP00073	PREMIX UL MRE-1	102.5	WIPA	100	Active	2	GKOP	Kg	0.067000
2877	WCD00110	CORE DOORCORE MRE 42x1232x2451	12.5026	WIV00011	VENEER SG 2x1220x1220	1.1908	WIPA	100	Active	0	GKOP	m3	10.499300
2878	WCD00110	CORE DOORCORE MRE 42x1232x2451	12.5026	RMB00038	ALBASIA FALCATA BARECORE A 13x1232x2451	7.851	WIPA	100	Active	1	GKOP	m3	1.592500
2879	WCD00110	CORE DOORCORE MRE 42x1232x2451	12.5026	RMB00073	ALBASIA FALCATA BARECORE A 13 CENTER CORE	3.925521	WIPA	100	Active	2	GKOP	m3	3.185000
2880	WCD00110	CORE DOORCORE MRE 42x1232x2451	12.5026	SUP00099	PREMIX MRE-0 1020	240	WIPA	100	Active	3	GKOP	Kg	0.052100
2881	WCD00111	CORE DOORCORE FJLC MRE 42x1220x3048	15.6180	FGF00057	FINGER JOINT 14x1232x3061	15.8388	WIPA	100	Active	0	PFIN	m3	0.986100
2882	WCD00111	CORE DOORCORE FJLC MRE 42x1220x3048	15.6180	SUP00099	PREMIX MRE-0 1020	130	WIPA	100	Active	1	GKOP	Kg	0.120100
2883	WCD00114	CORE DOORCORE FJLC MRE 42x1232x3061	15.8388	FGF00057	FINGER JOINT BBP 14x1232x3061	10.5592	WIPA	100	Active	0	PVAF	m3	1.500000
2884	WCD00114	CORE DOORCORE FJLC MRE 42x1232x3061	15.8388	FGF00065	FINGER JOINT BBP 14x1245x2500	6.53625	WIPA	100	Active	1	PVAF	m3	2.423200
2885	WCD00114	CORE DOORCORE FJLC MRE 42x1232x3061	15.8388	SUP00093	LEM HENKEL AQUENCE SL 8460 BC, 4.0	99	WIPA	100	Active	2	GKOP	kg	0.160000
2886	WCD00114	CORE DOORCORE FJLC MRE 42x1232x3061	15.8388	SUP00094	HARDENER HENKEL CATALYST 72-7357 M BC, 4.0	9	WIPA	100	Active	3	GKOP	kg	1.759900
2887	WCD00115	CORE DOORCORE RECONSTITUTED MRE 42x1220x2440	12.5026	WIV00011	VENEER SG 2x1220x1220	1.7862	WIPA	100	Active	0	GKOP	m3	6.999600
2888	WCD00115	CORE DOORCORE RECONSTITUTED MRE 42x1220x2440	12.5026	RMB00030	ALBASIA FALCATA BARECORE A 18.7x1220x2440	11.1332	WIPA	100	Active	1	GKOP	m3	1.123000
2889	WCD00115	CORE DOORCORE RECONSTITUTED MRE 42x1220x2440	12.5026	SUP00073	PREMIX UL MRE-1	240	WIPA	100	Active	2	GKOP	Kg	0.052100
2890	WCD00117	CORE DOORCORE MRE 26x932x2300	5.5734	RMB00108	ALBASIA FALCATA BARECORE A 12.5x932x2300	5.359	WIPA	100	Active	0	GKOP	m3	1.040000
2891	WCD00117	CORE DOORCORE MRE 26x932x2300	5.5734	WIV00267	VENEER SG 2x930x2300	0.4278	WIPA	100	Active	1	GKOP	m3	13.028100
2892	WCD00117	CORE DOORCORE MRE 26x932x2300	5.5734	SUP00073	PREMIX UL MRE-1	82.5	WIPA	100	Active	2	GKOP	Kg	0.067600
2893	WCD00117	CORE DOORCORE MRE 26x932x2300	5.5734	SUP00005	LEM PROTECTA C-3, BC 23	0.1	WIPA	100	Active	3	GKOP	kg	55.734000
2894	WCD00118	CORE DOORCORE MRE 3 LAYER 38x915x2135	7.4234	RMB00129	ALBASIA FALCATA BARECORE A 13x915x2135	5.0792	WIPA	100	Active	0	GKOP	m3	1.461500
2895	WCD00118	CORE DOORCORE MRE 3 LAYER 38x915x2135	7.4234	RMB00073	ALBASIA FALCATA BARECORE A 13 CENTER CORE	2.539582	WIPA	100	Active	1	GKOP	m3	2.923100
2896	WCD00118	CORE DOORCORE MRE 3 LAYER 38x915x2135	7.4234	SUP00073	PREMIX UL MRE-1	76.875	WIPA	100	Active	2	GKOP	Kg	0.096600
2897	WCD00119	CORE DOORCORE 3 LAYER MRE 42x1220x2440	12.5026	WIV00011	VENEER SG 2x1220x1220	1.1908	WIPA	100	Active	0	GKOP	m3	10.499300
2898	WCD00119	CORE DOORCORE 3 LAYER MRE 42x1220x2440	12.5026	RMB00114	ALBASIA FALCATA BARECORE B 13x1220x2440	7.7396	WIPA	100	Active	1	GKOP	m3	1.615400
2899	WCD00119	CORE DOORCORE 3 LAYER MRE 42x1220x2440	12.5026	RMB00117	ALBASIA FALCATA BARECORE B 13 CENTER CORE	3.86984	WIPA	100	Active	2	GKOP	m3	3.230800
2900	WCD00119	CORE DOORCORE 3 LAYER MRE 42x1220x2440	12.5026	SUP00073	PREMIX UL MRE-1	205	WIPA	100	Active	3	GKOP	Kg	0.061000
2901	WCD00120	CORE DOORCORE RECONSTITUTED MRE 3 LAYER 42x1220x2440	12.5026	WIV00011	VENEER SG 2x1220x1220	1.7862	WIPA	100	Active	0	GKOP	m3	6.999600
2902	WCD00120	CORE DOORCORE RECONSTITUTED MRE 3 LAYER 42x1220x2440	12.5026	RMB00030	ALBASIA FALCATA BARECORE A 18.7x1220x2440	11.1332	WIPA	100	Active	1	WADA	m3	1.123000
2903	WCD00120	CORE DOORCORE RECONSTITUTED MRE 3 LAYER 42x1220x2440	12.5026	SUP00073	PREMIX UL MRE-1	240	WIPA	100	Active	2	GKOP	Kg	0.052100
2904	WCD00121	CORE DOORCORE RECONSTITUTED MRE 30x1220x2440	8.9304	WIV00032	VENEER SG 2.6x1220x2440	1.548	WIPA	100	Active	0	GKOP	m3	5.769000
2905	WCD00121	CORE DOORCORE RECONSTITUTED MRE 30x1220x2440	8.9304	RMB00114	ALBASIA FALCATA BARECORE B 13x1220x2440	7.7396	WIPA	100	Active	1	GKOP	m3	1.153900
2906	WCD00121	CORE DOORCORE RECONSTITUTED MRE 30x1220x2440	8.9304	WIV00011	VENEER SG 2x1220x1220	0.5954	WIPA	100	Active	2	GKOP	m3	14.999000
2907	WCD00121	CORE DOORCORE RECONSTITUTED MRE 30x1220x2440	8.9304	SUP00073	PREMIX UL MRE-1	220	WIPA	100	Active	3	GKOP	Kg	0.040600
2908	WCD00122	CORE DOORCORE MRE 30x1232x2451	9.0589	RMB00037	ALBASIA FALCATA BARECORE A 10.5x1232x2451	6.3412	WIPA	100	Active	0	GKOP	m3	1.428600
2909	WCD00122	CORE DOORCORE MRE 30x1232x2451	9.0589	RMB00072	ALBASIA FALCATA BARECORE A 10.5 CENTER CORE	3.170613	WIPA	100	Active	1	GKOP	m3	2.857100
2910	WCD00122	CORE DOORCORE MRE 30x1232x2451	9.0589	SUP00099	PREMIX MRE-0 1020	110	WIPA	100	Active	2	GKOP	Kg	0.082400
2911	WCD00123	CORE DOORCORE MRE 3 LAYER 42x915x2135	8.2048	RMB00005	ALBASIA FALCATA BARECORE B 13x915x2135	5.0792	WIPA	100	Active	0	GKOP	m3	1.615400
2912	WCD00123	CORE DOORCORE MRE 3 LAYER 42x915x2135	8.2048	RMB00117	ALBASIA FALCATA BARECORE B 13 CENTER CORE	2.539582	WIPA	100	Active	1	GKOP	m3	3.230800
2913	WCD00123	CORE DOORCORE MRE 3 LAYER 42x915x2135	8.2048	WIV00008	VENEER SG 2x930x2150	0.7998	WIPA	100	Active	2	GKOP	m3	10.258600
2914	WCD00123	CORE DOORCORE MRE 3 LAYER 42x915x2135	8.2048	SUP00073	PREMIX UL MRE-1	211.8	WIPA	100	Active	3	GKOP	Kg	0.038700
2915	WCD00124	CORE DOORCORE MRE 23x932x2300	4.9303	RMB00151	ALBASIA FALCATA BARECORE A 10.5x932x2300	4.5016	WIPA	100	Active	0	GKOP	m3	1.095200
2916	WCD00124	CORE DOORCORE MRE 23x932x2300	4.9303	WIV00372	VENEER SG 2x930x2400	0.4464	WIPA	100	Active	1	GKOP	m3	11.044600
2917	WCD00124	CORE DOORCORE MRE 23x932x2300	4.9303	SUP00073	PREMIX UL MRE-1	105.9	WIPA	100	Active	2	GKOP	Kg	0.046600
2918	WCD00125	CORE DOORCORE RECONSTITUTED MRE 52x915x2135	10.1583	RMB00149	ALBASIA FALCATA BARECORE A 16.5x915x2135	6.4466	WIPA	100	Active	0	GKOP	m3	1.575800
2919	WCD00125	CORE DOORCORE RECONSTITUTED MRE 52x915x2135	10.1583	RMB00110	ALBASIA FALCATA BARECORE A 16 CENTER CORE	3.29912	WIPA	100	Active	1	GKOP	m3	3.079100
2920	WCD00125	CORE DOORCORE RECONSTITUTED MRE 52x915x2135	10.1583	WIV00008	VENEER SG 2x930x2150	0.7998	WIPA	100	Active	2	GKOP	m3	12.701100
2921	WCD00125	CORE DOORCORE RECONSTITUTED MRE 52x915x2135	10.1583	SUP00073	PREMIX UL MRE-1	211.8	WIPA	100	Active	3	GKOP	Kg	0.048000
2922	WCD00126	CORE DOORCORE RECONSTITUTED MRE 52x838x2040	8.8895	WIV00372	VENEER SG 2x930x2400	0.8928	WIPA	100	Active	0	GKOP	m3	9.956900
2923	WCD00126	CORE DOORCORE RECONSTITUTED MRE 52x838x2040	8.8895	RMB00153	ALBASIA FALCATA BARECORE A 16.5x838x2040	8.4621	WIPA	100	Active	1	GKOP	m3	1.050500
2924	WCD00126	CORE DOORCORE RECONSTITUTED MRE 52x838x2040	8.8895	SUP00073	PREMIX UL MRE-1	211.8	WIPA	100	Active	2	GKOP	Kg	0.042000
2925	WCL00003	CORE LVL 36x860x1967	6.0898	WIV00074	VENEER LG 2.6x930x2200	3.192	WIPA	100	Active	0	WIVE	m3	1.907800
2926	WCL00003	CORE LVL 36x860x1967	6.0898	WIV00023	VENEER SG 2.6x930x2150	4.6791	WIPA	100	Active	1	WIVE	m3	1.301500
2927	WCL00003	CORE LVL 36x860x1967	6.0898	SUP00073	PREMIX UL	700	WIPA	100	Active	2	SUPP	Kg	0.008700
2928	WCL00004	CORE LVL 36x860x2267	7.0186	WIV00075	VENEER LG 2.6x930x2440	3.54	WIPA	100	Active	0	WIVE	m3	1.982700
2929	WCL00004	CORE LVL 36x860x2267	7.0186	WIV00024	VENEER SG 2.6x930x2440	5.31	WIPA	100	Active	1	WIVE	m3	1.321800
2930	WCL00004	CORE LVL 36x860x2267	7.0186	SUP00073	PREMIX UL	700	WIPA	100	Active	2	SUPP	Kg	0.010000
2931	WCL00005	CORE LVL 36x1220x1220	5.3582	WIV00011	VENEER SG 2x1220x1220	5.6563	WIPA	100	Active	0	WIVE	m3	0.947300
2932	WCL00005	CORE LVL 36x1220x1220	5.3582	SUP00073	PREMIX UL	900	WIPA	100	Active	1	SUPP	Kg	0.006000
2933	WCL00007	CORE LVL 38x820x1967	6.1292	WIV00074	VENEER LG 2.6x930x2200	3.192	WIPA	100	Active	0	WIVE	m3	1.920200
2934	WCL00007	CORE LVL 38x820x1967	6.1292	WIV00023	VENEER SG 2.6x930x2150	4.6791	WIPA	100	Active	1	WIVE	m3	1.309900
2935	WCL00007	CORE LVL 38x820x1967	6.1292	SUP00073	PREMIX UL	700	WIPA	100	Active	2	SUPP	Kg	0.008800
2936	WCL00008	CORE LVL 38x820x2267	7.0640	WIV00075	VENEER LG 2.6x930x2440	3.54	WIPA	100	Active	0	WIVE	m3	1.995500
2937	WCL00008	CORE LVL 38x820x2267	7.0640	WIV00024	VENEER SG 2.6x930x2440	5.31	WIPA	100	Active	1	WIVE	m3	1.330300
2938	WCL00008	CORE LVL 38x820x2267	7.0640	SUP00073	PREMIX UL	700	WIPA	100	Active	2	SUPP	Kg	0.010100
2939	WCL00009	CORE LVL F4 10x1220x2440	2.9768	WIV00524	VENEER LG 2x1220x2500	3.66	WIPA	100	Active	0	GKOP	m3	0.813300
2940	WCL00009	CORE LVL F4 10x1220x2440	2.9768	SUP00080	PREMIX UL F*4	256.25	WIPA	100	Active	1	GKOP	Kg	0.011600
2941	WCL00016	CORE LVL 16x739x2032	4.7629	WIV00293	VENEER LG 2x770x2200	3.388	WIPA	100	Active	0	GKOP	m3	1.405800
2942	WCL00016	CORE LVL 16x739x2032	4.7629	SUP00075	PREMIX BONDTITE	396	WIPA	100	Active	1	GKOP	Kg	0.012000
2943	WCL00018	CORE LVL 16x930x1100	1.6368	WIV00007	VENEER SG 2x930x1150	2.139	WIPA	100	Active	0	WIVE	m3	0.765200
2944	WCL00018	CORE LVL 16x930x1100	1.6368	SUP00075	PREMIX BONDTITE	396	WIPA	100	Active	1	GKOP	Kg	0.004100
2945	WCL00029	CORE LVL MRE 30x860x1967	5.0749	WIV00023	VENEER SG 2.6x930x2150	3.1194	WIPA	100	Active	0	GKOP	m3	1.626900
2946	WCL00029	CORE LVL MRE 30x860x1967	5.0749	WIV00008	VENEER SG 2x930x2150	3.5991	WIPA	100	Active	1	GKOP	m3	1.410000
2947	WCL00029	CORE LVL MRE 30x860x1967	5.0749	SUP00073	PREMIX UL MRE-1	307.5	WIPA	100	Active	2	GKOP	Kg	0.016500
2948	WCL00030	CORE LVL MRE 30x860x2267	5.8489	WIV00302	VENEER LG 2.6x930x2300	4.4488	WIPA	100	Active	0	GKOP	m3	1.314700
2949	WCL00030	CORE LVL MRE 30x860x2267	5.8489	WIV00267	VENEER SG 2x930x2300	1.2834	WIPA	100	Active	1	GKOP	m3	4.557300
2950	WCL00030	CORE LVL MRE 30x860x2267	5.8489	WIV00304	VENEER SG 2.6x930x2300	1.1122	WIPA	100	Active	2	GKOP	m3	5.258900
2951	WCL00030	CORE LVL MRE 30x860x2267	5.8489	SUP00073	PREMIX UL MRE-1	461.25	WIPA	100	Active	3	GKOP	Kg	0.012700
2952	WCL00037	CORE LVL MRE 32x860x1967	5.4132	WIV00332	VENEER LG 2x930x2000	5.952	WIPA	100	Active	0	GKOP	m3	0.909500
2953	WCL00037	CORE LVL MRE 32x860x1967	5.4132	SUP00099	PREMIX MRE-0 1020	820	WIPA	100	Active	1	GKOP	Kg	0.006600
2954	WCL00038	CORE LVL MRE 24x1220x2440	8.0374	WIV00524	VENEER LG 2x1220x2500	7.93	WIPA	100	Active	0	GKOP	m3	1.013500
2955	WCL00038	CORE LVL MRE 24x1220x2440	8.0374	SUP00099	PREMIX MRE-0 1020	615	WIPA	100	Active	1	GKOP	Kg	0.013100
2956	WCL00039	CORE LVL MRE 17x1220x2440	5.0606	WIV00524	VENEER LG 2x1220x2500	6.1	WIPA	100	Active	0	WIVE	m3	0.829600
2957	WCL00039	CORE LVL MRE 17x1220x2440	5.0606	SUP00099	PREMIX MRE-0 1020	512.5	WIPA	100	Active	1	GKOP	Kg	0.009900
2958	WCL00040	CORE LVL MRE 17x1220x2200	4.5628	WIV00069	VENEER LG 2x1220x2300	2.806	WIPA	100	Active	0	GKOP	m3	1.626100
2959	WCL00040	CORE LVL MRE 17x1220x2200	4.5628	WIV00587	VENEER SCRAFT 2x1220x2200	2.684	WIPA	100	Active	1	GKOP	m3	1.700000
2960	WCL00040	CORE LVL MRE 17x1220x2200	4.5628	SUP00099	PREMIX MRE-0 1020	512.5	WIPA	100	Active	2	GKOP	Kg	0.008900
2961	WCL00042	CORE LVL MRE 17x838x2200	3.1341	WIV00008	VENEER SG 2x930x2150	1.5996	WIPA	100	Active	0	GKOP	m3	1.959300
2962	WCL00042	CORE LVL MRE 17x838x2200	3.1341	WIV00003	VENEER SG 1.3x930x2150	1.8193	WIPA	100	Active	1	GKOP	m3	1.722700
2963	WCL00042	CORE LVL MRE 17x838x2200	3.1341	SUP00099	PREMIX MRE-0 1020	384.375	WIPA	100	Active	2	GKOP	Kg	0.008200
2964	WCL00043	CORE LVL MRE 17x1220x1220	2.5303	WIV00011	VENEER SG 2x1220x1220	2.977	WIPA	100	Active	0	GKOP	m3	0.849900
2965	WCL00043	CORE LVL MRE 17x1220x1220	2.5303	WIV00025	VENEER SG 2.6x1220x1220	3.87	WIPA	100	Active	1	GKOP	m3	0.653800
2966	WCL00043	CORE LVL MRE 17x1220x1220	2.5303	SUP00099	PREMIX MRE-0 1020	264	WIPA	100	Active	2	GKOP	Kg	0.009600
2967	WCP00001	CORE PLYWOOD 6x1220x2440	1.7861	WIV00032	VENEER SG 2.6x1220x2440	1.548	WIPA	100	Active	0	WIVE	m3	1.153800
2968	WCP00001	CORE PLYWOOD 6x1220x2440	1.7861	WIV00077	VENEER LG 2.6x1220x2440	0.774	WIPA	100	Active	1	WIVE	m3	2.307600
2969	WCP00001	CORE PLYWOOD 6x1220x2440	1.7861	SUP00099	PREMIX MRE-0 1020	102.5	WIPA	100	Active	2	GKOP	Kg	0.017400
2970	WCP00003	CORE PLYWOOD 7x1232x1842	1.5885	WIV00081	VENEER LG 3.2x1220x1900	0.7418	WIPA	100	Active	0	WIVE	m3	2.141400
2971	WCP00003	CORE PLYWOOD 7x1232x1842	1.5885	WIV00322	VENEER SG 2.8x1220x2000	1.3664	WIPA	100	Active	1	WIVE	m3	1.162500
2972	WCP00003	CORE PLYWOOD 7x1232x1842	1.5885	SUP00075	PREMIX BONDTITE	99	WIPA	100	Active	2	GKOP	Kg	0.016000
2973	WCP00005	CORE PLYWOOD MDF MRE 12x1220x2440	3.5722	WIV00011	VENEER SG 2x1220x1220	2.3816	WIPA	100	Active	0	WIVE	m3	1.499900
2974	WCP00005	CORE PLYWOOD MDF MRE 12x1220x2440	3.5722	WIV00524	VENEER LG 2x1220x2500	1.83	WIPA	100	Active	1	GKOP	m3	1.952000
2975	WCP00005	CORE PLYWOOD MDF MRE 12x1220x2440	3.5722	SUP00099	PREMIX MRE-0 1020	307.5	WIPA	100	Active	2	GKOP	Kg	0.011600
2976	WCP00009	CORE PLYWOOD 21x1220x2440	6.2513	WIV00032	VENEER SG 2.6x1220x2440	1.548	WIPA	100	Active	0	GKOP	m3	4.038300
2977	WCP00009	CORE PLYWOOD 21x1220x2440	6.2513	WIV00524	VENEER LG 2x1220x2500	3.05	WIPA	100	Active	1	GKOP	m3	2.049600
2978	WCP00009	CORE PLYWOOD 21x1220x2440	6.2513	WIV00011	VENEER SG 2x1220x1220	2.3816	WIPA	100	Active	2	GKOP	m3	2.624800
2979	WCP00009	CORE PLYWOOD 21x1220x2440	6.2513	SUP00099	PREMIX MRE-0 1020	600	WIPA	100	Active	3	GKOP	Kg	0.010400
2980	WCP00018	CORE PLYWOOD MRE 16x1220x2500	4.8800	WIV00015	VENEER SG 2x1220x2440	1.7862	WIPA	100	Active	0	GKOP	m3	2.732100
2981	WCP00018	CORE PLYWOOD MRE 16x1220x2500	4.8800	WIV00524	VENEER LG 2x1220x2500	2.44	WIPA	100	Active	1	GKOP	m3	2.000000
2982	WCP00018	CORE PLYWOOD MRE 16x1220x2500	4.8800	WIV00011	VENEER SG 2x1220x1220	1.1908	WIPA	100	Active	2	GKOP	m3	4.098100
2983	WCP00018	CORE PLYWOOD MRE 16x1220x2500	4.8800	SUP00099	PREMIX MRE-0 1020	423.6	WIPA	100	Active	3	GKOP	Kg	0.011500
2984	WCP00021	CORE PLYWOOD MRE 10x1220x2500	3.0500	WIV00032	VENEER SG 2.6x1220x2440	2.322	WIPA	100	Active	0	GKOP	m3	1.313500
2985	WCP00021	CORE PLYWOOD MRE 10x1220x2500	3.0500	WIV00524	VENEER LG 2x1220x2500	1.22	WIPA	100	Active	1	GKOP	m3	2.500000
2986	WCP00021	CORE PLYWOOD MRE 10x1220x2500	3.0500	SUP00099	PREMIX MRE-0 1020	211.8	WIPA	100	Active	2	GKOP	Kg	0.014400
2987	WCP00023	CORE PLYWOOD MRE 19x1220x2440	5.6559	WIV00032	VENEER SG 2.6x1220x2440	3.096	WIPA	100	Active	0	GKOP	m3	1.826800
2988	WCP00023	CORE PLYWOOD MRE 19x1220x2440	5.6559	WIV00025	VENEER SG 2.6x1220x1220	0.774	WIPA	100	Active	1	GKOP	m3	7.307400
2989	WCP00023	CORE PLYWOOD MRE 19x1220x2440	5.6559	WIV00524	VENEER LG 2x1220x2500	2.44	WIPA	100	Active	2	GKOP	m3	2.318000
2990	WCP00023	CORE PLYWOOD MRE 19x1220x2440	5.6559	SUP00073	PREMIX UL MRE-1	410	WIPA	100	Active	3	GKOP	Kg	0.013800
2991	WCP00025	CORE PLYWOOD MRE 7.3x1220x2300	2.0484	WIV00448	VENEER SG 1.7x1220x1220	1.518	WIPA	100	Active	0	GKOP	m3	1.349400
2992	WCP00025	CORE PLYWOOD MRE 7.3x1220x2300	2.0484	WIV00273	VENEER LG 1.7x1220x2300	0.954	WIPA	100	Active	1	WIVE	m3	2.147200
2993	WCP00025	CORE PLYWOOD MRE 7.3x1220x2300	2.0484	SUP00099	PREMIX MRE-0 1020	205	WIPA	100	Active	2	GKOP	Kg	0.010000
2994	WCP00026	CORE PLYWOOD MULTIPLY MRE 7x1220x2500	2.1350	WIV00434	VENEER SG 1.7x1220x2440	1.5183	WIPA	100	Active	0	GKOP	m3	1.406200
2995	WCP00026	CORE PLYWOOD MULTIPLY MRE 7x1220x2500	2.1350	WIV00602	VENEER LG 1.7x1220x2500	1.037	WIPA	100	Active	1	WIVE	m3	2.058800
2996	WCP00026	CORE PLYWOOD MULTIPLY MRE 7x1220x2500	2.1350	SUP00099	PREMIX MRE-0 1020	220	WIPA	100	Active	2	GKOP	Kg	0.009700
2997	WCP00029	CORE PLYWOOD 9x694x2190	1.3679	WIV00293	VENEER LG 2x770x2200	0.6776	WIPA	100	Active	0	WIVE	m3	2.018700
2998	WCP00029	CORE PLYWOOD 9x694x2190	1.3679	WIV00279	VENEER SG 2x770x2200	1.0164	WIPA	100	Active	1	WIVE	m3	1.345800
2999	WCP00029	CORE PLYWOOD 9x694x2190	1.3679	SUP00079	PREMIX UL MRE-0	100	WIPA	100	Active	2	SUPP	Kg	0.013700
3000	WCP00030	CORE PLYWOOD 9x694x1990	1.2430	WIV00254	VENEER LG 2x770x2000	0.616	WIPA	100	Active	0	WIVE	m3	2.017900
3001	WCP00030	CORE PLYWOOD 9x694x1990	1.2430	WIV00213	VENEER SG 2x770x2000	0.924	WIPA	100	Active	1	WIVE	m3	1.345200
3002	WCP00030	CORE PLYWOOD 9x694x1990	1.2430	SUP00079	PREMIX UL MRE-0	100	WIPA	100	Active	2	SUPP	Kg	0.012400
3003	WCP00033	CORE PLYWOOD 9x1220x2200	2.4156	WIV00290	VENEER LG 2x1220x2200	1.0736	WIPA	100	Active	0	WIVE	m3	2.250000
3004	WCP00033	CORE PLYWOOD 9x1220x2200	2.4156	WIV00281	VENEER SG 2x1220x2200	1.6104	WIPA	100	Active	1	WIVE	m3	1.500000
3005	WCP00033	CORE PLYWOOD 9x1220x2200	2.4156	SUP00079	PREMIX UL MRE-0	200	WIPA	100	Active	2	SUPP	Kg	0.012100
3006	WCP00034	CORE PLYWOOD COMBICORE WBP 14x1220x2440	4.1675	WIV00749	VENEER SG JABON 2.2x1220x2440	1.3098	WIPA	100	Active	0	GKOP	m3	3.181800
3007	WCP00034	CORE PLYWOOD COMBICORE WBP 14x1220x2440	4.1675	WIV00752	VENEER SCRAFT LG JABON 2.2x1220x2500	1.342	WIPA	100	Active	1	GKOP	m3	3.105400
3008	WCP00034	CORE PLYWOOD COMBICORE WBP 14x1220x2440	4.1675	WIV00025	VENEER SG 2.6x1220x1220	0.774	WIPA	100	Active	2	GKOP	m3	5.384400
3009	WCP00034	CORE PLYWOOD COMBICORE WBP 14x1220x2440	4.1675	WIV00590	VENEER LG 2.6x1220x2500	0.793	WIPA	100	Active	3	GKOP	m3	5.255400
3010	WCP00034	CORE PLYWOOD COMBICORE WBP 14x1220x2440	4.1675	SUP00075	PREMIX BONDTITE	297	WIPA	100	Active	4	GKOP	Kg	0.014000
3011	WCP00059	CORE PLYWOOD MRE 3x1220x2440	0.8930	WIV00524	VENEER LG 2x1220x2500	0.61	WIPA	100	Active	0	GKOP	m3	1.463900
3012	WCP00059	CORE PLYWOOD MRE 3x1220x2440	0.8930	WIV00015	VENEER SG 2x1220x2440	0.5954	WIPA	100	Active	1	GKOP	m3	1.499800
3013	WCP00059	CORE PLYWOOD MRE 3x1220x2440	0.8930	SUP00099	PREMIX MRE-0 1020	102.5	WIPA	100	Active	2	GKOP	Kg	0.008700
3014	WCP00076	CORE PLYWOOD MRE 10.3x1220x2440	3.0661	WIV00032	VENEER SG 2.6x1220x2440	2.322	WIPA	100	Active	0	GKOP	m3	1.320500
3015	WCP00076	CORE PLYWOOD MRE 10.3x1220x2440	3.0661	WIV00524	VENEER LG 2x1220x2500	1.22	WIPA	100	Active	1	GKOP	m3	2.513200
3016	WCP00076	CORE PLYWOOD MRE 10.3x1220x2440	3.0661	SUP00099	PREMIX MRE-0 1020	240	WIPA	100	Active	2	GKOP	Kg	0.012800
3017	WCP00077	CORE PLYWOOD MRE 7.3x1220x2440	2.1731	WIV00524	VENEER LG 2x1220x2500	1.83	WIPA	100	Active	0	GKOP	m3	1.187500
3018	WCP00077	CORE PLYWOOD MRE 7.3x1220x2440	2.1731	WIV00015	VENEER SG 2x1220x2440	1.1908	WIPA	100	Active	1	GKOP	m3	1.824900
3019	WCP00077	CORE PLYWOOD MRE 7.3x1220x2440	2.1731	SUP00073	PREMIX UL MRE-1	234.3009	WIPA	100	Active	2	GKOP	Kg	0.009300
3020	WCP00078	CORE PLYWOOD MRE 13.3x1220x2440	3.9591	WIV00032	VENEER SG 2.6x1220x2440	0.774	WIPA	100	Active	0	GKOP	m3	5.115100
3021	WCP00078	CORE PLYWOOD MRE 13.3x1220x2440	3.9591	WIV00524	VENEER LG 2x1220x2500	1.83	WIPA	100	Active	1	GKOP	m3	2.163400
3022	WCP00078	CORE PLYWOOD MRE 13.3x1220x2440	3.9591	WIV00011	VENEER SG 2x1220x1220	1.7862	WIPA	100	Active	2	GKOP	m3	2.216500
3023	WCP00078	CORE PLYWOOD MRE 13.3x1220x2440	3.9591	SUP00073	PREMIX UL MRE-1	330	WIPA	100	Active	3	GKOP	Kg	0.012000
3024	WCP00079	CORE PLYWOOD MRE 16.3x1220x2440	4.8522	WIV00015	VENEER SG 2x1220x2440	2.977	WIPA	100	Active	0	GKOP	m3	1.629900
3025	WCP00079	CORE PLYWOOD MRE 16.3x1220x2440	4.8522	WIV00524	VENEER LG 2x1220x2500	2.44	WIPA	100	Active	1	GKOP	m3	1.988600
3026	WCP00079	CORE PLYWOOD MRE 16.3x1220x2440	4.8522	SUP00099	PREMIX MRE-0 1020	423.6	WIPA	100	Active	2	GKOP	Kg	0.011500
3027	WCP00082	CORE PLYWOOD MRE 4.3x1220x2440	1.2800	WIV00602	VENEER LG 1.7x1220x2500	1.037	WIPA	100	Active	0	GKOP	m3	1.234300
3028	WCP00082	CORE PLYWOOD MRE 4.3x1220x2440	1.2800	WIV00011	VENEER SG 2x1220x1220	0.5954	WIPA	100	Active	1	GKOP	m3	2.149800
3029	WCP00082	CORE PLYWOOD MRE 4.3x1220x2440	1.2800	SUP00073	PREMIX UL MRE-1	120	WIPA	100	Active	2	GKOP	Kg	0.010700
3030	WCP00087	CORE PLYWOOD MRE 3.8x1220x2440	1.1312	WIV00524	VENEER LG 2x1220x2500	0.61	WIPA	100	Active	0	GKOP	m3	1.854400
3031	WCP00087	CORE PLYWOOD MRE 3.8x1220x2440	1.1312	WIV00004	VENEER SG 1.3x1220x1220	0.774	WIPA	100	Active	1	GKOP	m3	1.461500
3032	WCP00087	CORE PLYWOOD MRE 3.8x1220x2440	1.1312	SUP00099	PREMIX MRE-0 1020	102.5	WIPA	100	Active	2	GKOP	Kg	0.011000
3033	WCP00100	CORE PLYWOOD WBP 10.3x1220x2440	3.0661	WIV00025	VENEER SG 2.6x1220x1220	2.322	WIPA	100	Active	0	GKOP	m3	1.320500
3034	WCP00100	CORE PLYWOOD WBP 10.3x1220x2440	3.0661	WIV00524	VENEER LG 2x1220x2500	1.22	WIPA	100	Active	1	GKOP	m3	2.513200
3035	WCP00100	CORE PLYWOOD WBP 10.3x1220x2440	3.0661	SUP00075	PREMIX BONDTITE	205	WIPA	100	Active	2	GKOP	Kg	0.015000
3036	WCP00100	CORE PLYWOOD WBP 10.3x1220x2440	3.0661	SUP00005	LEM PROTECTA C-3, BC 23	0.2	WIPA	100	Active	3	SUPP	kg	15.330500
3037	WCP00102	CORE PLYWOOD WBP 16.3x1220x2440	4.8522	WIV00015	VENEER SG 2x1220x2440	2.977	WIPA	100	Active	0	GKOP	m3	1.629900
3038	WCP00102	CORE PLYWOOD WBP 16.3x1220x2440	4.8522	WIV00524	VENEER LG 2x1220x2500	2.44	WIPA	100	Active	1	GKOP	m3	1.988600
3039	WCP00102	CORE PLYWOOD WBP 16.3x1220x2440	4.8522	SUP00075	PREMIX BONDTITE	396	WIPA	100	Active	2	GKOP	Kg	0.012300
3040	WCP00112	CORE PLYWOOD COMBICORE MRE 14x1220x2440	4.1675	WIV00752	VENEER SCRAFT LG JABON 2.2x1220x2500	2.684	WIPA	100	Active	0	GKOP	m3	1.552700
3041	WCP00112	CORE PLYWOOD COMBICORE MRE 14x1220x2440	4.1675	WIV00025	VENEER SG 2.6x1220x1220	1.548	WIPA	100	Active	1	GKOP	m3	2.692200
3042	WCP00112	CORE PLYWOOD COMBICORE MRE 14x1220x2440	4.1675	WIV00011	VENEER SG 2x1220x1220	0.5954	WIPA	100	Active	2	GKOP	m3	6.999500
3043	WCP00112	CORE PLYWOOD COMBICORE MRE 14x1220x2440	4.1675	SUP00099	PREMIX MRE-0 1020	390	WIPA	100	Active	3	GKOP	Kg	0.010700
3044	WCP00113	CORE PLYWOOD WBP MULTIPLY COMBICORE 10x1220x2440	2.9768	WIV00809	VENEER SG JABON 1.7x1220x1220	2.024	PFIN	100	Active	0	GKOP	m3	1.470800
3045	WCP00113	CORE PLYWOOD WBP MULTIPLY COMBICORE 10x1220x2440	2.9768	WIV00602	VENEER LG 1.7x1220x2500	1.5555	PFIN	100	Active	1	GKOP	m3	1.913700
3046	WCP00113	CORE PLYWOOD WBP MULTIPLY COMBICORE 10x1220x2440	2.9768	SUP00075	PREMIX BONDTITE	396	PFIN	100	Active	2	GKOP	Kg	0.007500
3047	WCP00114	CORE PLYWOOD WBP 14.3x1260x2500	4.5045	WIV00011	VENEER SG 2x1220x1220	2.3816	WIPA	100	Active	0	GKOP	m3	1.891400
3048	WCP00114	CORE PLYWOOD WBP 14.3x1260x2500	4.5045	WIV00590	VENEER LG 2.6x1220x2500	2.379	WIPA	100	Active	1	GKOP	m3	1.893400
3049	WCP00114	CORE PLYWOOD WBP 14.3x1260x2500	4.5045	SUP00075	PREMIX BONDTITE	360	WIPA	100	Active	2	GKOP	Kg	0.012500
3050	WCP00115	CORE PLYWOOD MRE 10.3x1220x2300	2.8902	WIV00032	VENEER SG 2.6x1220x2440	2.322	WIPA	100	Active	0	GKOP	m3	1.244700
3051	WCP00115	CORE PLYWOOD MRE 10.3x1220x2300	2.8902	WIV00069	VENEER LG 2x1220x2300	1.1224	WIPA	100	Active	1	GKOP	m3	2.575000
3052	WCP00115	CORE PLYWOOD MRE 10.3x1220x2300	2.8902	SUP00099	PREMIX MRE-0 1020	360	WIPA	100	Active	2	GKOP	Kg	0.008000
3053	WCP00117	CORE PLYWOOD COMBICORE MRE JABON 16.3x1232x2452	4.9240	WIV00752	VENEER SCRAFT LG JABON 2.2x1220x2500	2.684	WIPA	100	Active	0	GKOP	m3	1.834600
3054	WCP00117	CORE PLYWOOD COMBICORE MRE JABON 16.3x1232x2452	4.9240	WIV00025	VENEER SG 2.6x1220x1220	2.322	WIPA	100	Active	1	GKOP	m3	2.120600
3055	WCP00117	CORE PLYWOOD COMBICORE MRE JABON 16.3x1232x2452	4.9240	SUP00099	PREMIX MRE-0 1020	360	WIPA	100	Active	2	GKOP	Kg	0.013700
3056	WCP00121	CORE PLYWOOD WBP COMBICORE MULTIPLEX 16x1220x2440	4.7629	WIV00809	VENEER SG JABON 1.7x1220x1220	3.036	WIPA	100	Active	0	GKOP	m3	1.568800
3057	WCP00121	CORE PLYWOOD WBP COMBICORE MULTIPLEX 16x1220x2440	4.7629	WIV00602	VENEER LG 1.7x1220x2500	2.5925	WIPA	100	Active	1	GKOP	m3	1.837200
3058	WCP00121	CORE PLYWOOD WBP COMBICORE MULTIPLEX 16x1220x2440	4.7629	SUP00075	PREMIX BONDTITE	495	WIPA	100	Active	2	GKOP	Kg	0.009600
3059	WCP00122	CORE PLYWOOD WBP 14.5x1220x2440	4.3164	WIV00015	VENEER SG 2x1220x2440	1.1908	WIPA	100	Active	0	GKOP	m3	3.624800
3060	WCP00122	CORE PLYWOOD WBP 14.5x1220x2440	4.3164	WIV00602	VENEER LG 1.7x1220x2500	2.074	WIPA	100	Active	1	GKOP	m3	2.081200
3061	WCP00122	CORE PLYWOOD WBP 14.5x1220x2440	4.3164	WIV00434	VENEER SG 1.7x1220x2440	1.5183	WIPA	100	Active	2	GKOP	m3	2.842900
3062	WCP00122	CORE PLYWOOD WBP 14.5x1220x2440	4.3164	SUP00075	PREMIX BONDTITE	600	WIPA	100	Active	3	GKOP	Kg	0.007200
3063	WCP00123	CORE PLYWOOD MULTIPLEX MRE 13x1220x2500	3.9650	WIV00434	VENEER SG 1.7x1220x2440	1.5183	WIPA	100	Active	0	GKOP	m3	2.611500
3064	WCP00123	CORE PLYWOOD MULTIPLEX MRE 13x1220x2500	3.9650	WIV00602	VENEER LG 1.7x1220x2500	2.074	WIPA	100	Active	1	GKOP	m3	1.911800
3065	WCP00123	CORE PLYWOOD MULTIPLEX MRE 13x1220x2500	3.9650	WIV00448	VENEER SG 1.7x1220x1220	1.012	WIPA	100	Active	2	GKOP	m3	3.918000
3066	WCP00123	CORE PLYWOOD MULTIPLEX MRE 13x1220x2500	3.9650	SUP00099	PREMIX MRE-0 1020	316.8	WIPA	100	Active	3	GKOP	Kg	0.012500
3067	WCP00124	CORE PLYWOOD MULTIPLEX MRE 10x1220x2500	3.0500	WIV00434	VENEER SG 1.7x1220x2440	1.0122	WIPA	100	Active	0	GKOP	m3	3.013200
3068	WCP00124	CORE PLYWOOD MULTIPLEX MRE 10x1220x2500	3.0500	WIV00602	VENEER LG 1.7x1220x2500	1.5555	WIPA	100	Active	1	GKOP	m3	1.960800
3069	WCP00124	CORE PLYWOOD MULTIPLEX MRE 10x1220x2500	3.0500	WIV00448	VENEER SG 1.7x1220x1220	1.012	WIPA	100	Active	2	GKOP	m3	3.013800
3070	WCP00124	CORE PLYWOOD MULTIPLEX MRE 10x1220x2500	3.0500	SUP00099	PREMIX MRE-0 1020	360	WIPA	100	Active	3	GKOP	Kg	0.008500
3071	WCP00125	CORE PLYWOOD RECONSTITUTED MRE 10x1220x2500	3.0500	WIV00032	VENEER SG 2.6x1220x2440	2.322	WIPA	100	Active	0	GKOP	m3	1.313500
3072	WCP00125	CORE PLYWOOD RECONSTITUTED MRE 10x1220x2500	3.0500	WIV00524	VENEER LG 2x1220x2500	1.22	WIPA	100	Active	1	GKOP	m3	2.500000
3073	WCP00125	CORE PLYWOOD RECONSTITUTED MRE 10x1220x2500	3.0500	SUP00099	PREMIX MRE-0 1020	205	WIPA	100	Active	2	GKOP	Kg	0.014900
3074	WCP00126	CORE PLYWOOD RECONSTITUTED MRE 13x1220x2500	4.0443	WIV00032	VENEER SG 2.6x1220x2440	0.774	WIPA	100	Active	0	GKOP	m3	5.225200
3075	WCP00126	CORE PLYWOOD RECONSTITUTED MRE 13x1220x2500	4.0443	WIV00524	VENEER LG 2x1220x2500	1.83	WIPA	100	Active	1	GKOP	m3	2.210000
3076	WCP00126	CORE PLYWOOD RECONSTITUTED MRE 13x1220x2500	4.0443	WIV00015	VENEER SG 2x1220x2440	1.7862	WIPA	100	Active	2	GKOP	m3	2.264200
3077	WCP00126	CORE PLYWOOD RECONSTITUTED MRE 13x1220x2500	4.0443	SUP00099	PREMIX MRE-0 1020	360	WIPA	100	Active	3	GKOP	Kg	0.011200
3078	WCP00127	CORE PLYWOOD RECONSTITUTED MRE 14x1220x2500	4.2700	WIV00015	VENEER SG 2x1220x2440	2.3816	WIPA	100	Active	0	GKOP	m3	1.792900
3079	WCP00127	CORE PLYWOOD RECONSTITUTED MRE 14x1220x2500	4.2700	WIV00590	VENEER LG 2.6x1220x2500	2.379	WIPA	100	Active	1	GKOP	m3	1.794900
3080	WCP00127	CORE PLYWOOD RECONSTITUTED MRE 14x1220x2500	4.2700	SUP00099	PREMIX MRE-0 1020	360	WIPA	100	Active	2	GKOP	Kg	0.011900
3081	WCP00129	CORE PLYWOOD WBP 38x1040x2440	11.3118	WIV00032	VENEER SG 2.6x1220x2440	6.966	WIPA	100	Active	0	GKOP	m3	1.623900
3082	WCP00129	CORE PLYWOOD WBP 38x1040x2440	11.3118	WIV00524	VENEER LG 2x1220x2500	4.88	WIPA	100	Active	1	GKOP	m3	2.318000
3083	WCP00129	CORE PLYWOOD WBP 38x1040x2440	11.3118	SUP00075	PREMIX BONDTITE	891	WIPA	100	Active	2	GKOP	Kg	0.012700
3084	WCP00130	CORE PLYWOOD MULTIPLEX WBP 16x1220x2400	4.6848	WIV00011	VENEER SG 2x1220x1220	3.5724	WIPA	100	Active	0	GKOP	m3	1.311400
3085	WCP00130	CORE PLYWOOD MULTIPLEX WBP 16x1220x2400	4.6848	WIV00602	VENEER LG 1.7x1220x2500	2.5925	WIPA	100	Active	1	GKOP	m3	1.807100
3086	WCP00130	CORE PLYWOOD MULTIPLEX WBP 16x1220x2400	4.6848	SUP00075	PREMIX BONDTITE	495	WIPA	100	Active	2	GKOP	Kg	0.009500
3087	WCP00131	CORE PLYWOOD MRE COMBICORE 16x1232x2452	4.8334	WIV00752	VENEER SCRAFT LG JABON 2.2x1220x2500	1.342	WIPA	100	Active	0	GKOP	m3	3.601600
3088	WCP00131	CORE PLYWOOD MRE COMBICORE 16x1232x2452	4.8334	WIV00749	VENEER SG JABON 2.2x1220x2440	1.3098	WIPA	100	Active	1	GKOP	m3	3.690200
3089	WCP00131	CORE PLYWOOD MRE COMBICORE 16x1232x2452	4.8334	WIV00590	VENEER LG 2.6x1220x2500	1.586	WIPA	100	Active	2	GKOP	m3	3.047500
3090	WCP00131	CORE PLYWOOD MRE COMBICORE 16x1232x2452	4.8334	WIV00025	VENEER SG 2.6x1220x1220	0.387	WIPA	100	Active	3	GKOP	m3	12.489400
3091	WCP00131	CORE PLYWOOD MRE COMBICORE 16x1232x2452	4.8334	SUP00075	PREMIX BONDTITE	396	WIPA	100	Active	4	GKOP	Kg	0.012200
3092	WCP00132	CORE PLYWOOD MRE 7x1220x2280	1.9471	WIV00434	VENEER SG 1.7x1220x2440	1.5183	WIPA	100	Active	0	GKOP	m3	1.282400
3093	WCP00132	CORE PLYWOOD MRE 7x1220x2280	1.9471	WIV00273	VENEER LG 1.7x1220x2300	0.954	WIPA	100	Active	1	GKOP	m3	2.041000
3094	WCP00132	CORE PLYWOOD MRE 7x1220x2280	1.9471	SUP00099	PREMIX MRE-0 1020	220	WIPA	100	Active	2	GKOP	Kg	0.008900
3095	WCP00133	CORE PLYWOOD MRE 13.3x1245x2500	4.1396	WIV00524	VENEER LG 2x1220x2500	1.83	WIPA	100	Active	0	GKOP	m3	2.262100
3096	WCP00133	CORE PLYWOOD MRE 13.3x1245x2500	4.1396	WIV00011	VENEER SG 2x1220x1220	1.1908	WIPA	100	Active	1	GKOP	m3	3.476300
3097	WCP00133	CORE PLYWOOD MRE 13.3x1245x2500	4.1396	WIV00032	VENEER SG 2.6x1220x2440	1.548	WIPA	100	Active	2	GKOP	m3	2.674200
3098	WCP00133	CORE PLYWOOD MRE 13.3x1245x2500	4.1396	SUP00099	PREMIX MRE-0 1020	440	WIPA	100	Active	3	GKOP	Kg	0.009400
3099	WCP00134	CORE PLYWOOD MRE 13x1220x2500	3.9650	WIV00524	VENEER LG 2x1220x2500	1.83	WIPA	100	Active	0	GKOP	m3	2.166700
3100	WCP00134	CORE PLYWOOD MRE 13x1220x2500	3.9650	WIV00025	VENEER SG 2.6x1220x1220	1.548	WIPA	100	Active	1	GKOP	m3	2.561400
3101	WCP00134	CORE PLYWOOD MRE 13x1220x2500	3.9650	WIV00011	VENEER SG 2x1220x1220	1.1908	WIPA	100	Active	2	GKOP	m3	3.329700
3102	WCP00134	CORE PLYWOOD MRE 13x1220x2500	3.9650	SUP00099	PREMIX MRE-0 1020	330	WIPA	100	Active	3	GKOP	Kg	0.012000
3103	WCP00136	CORE PLYWOOD MRE 6.3x1220x2500	1.9215	WIV00032	VENEER SG 2.6x1220x2440	1.548	WIPA	100	Active	0	GKOP	m3	1.241300
3104	WCP00136	CORE PLYWOOD MRE 6.3x1220x2500	1.9215	WIV00524	VENEER LG 2x1220x2500	0.61	WIPA	100	Active	1	GKOP	m3	3.150000
3105	WCP00136	CORE PLYWOOD MRE 6.3x1220x2500	1.9215	SUP00099	PREMIX MRE-0 1020	102.5	WIPA	100	Active	2	GKOP	Kg	0.018700
3106	WCP00137	CORE PLYWOOD MULTIPLEX WBP 16x1220x2440	4.7629	WIV00448	VENEER SG 1.7x1220x1220	3.036	WIPA	100	Active	0	GKOP	m3	1.568800
3107	WCP00137	CORE PLYWOOD MULTIPLEX WBP 16x1220x2440	4.7629	WIV00602	VENEER LG 1.7x1220x2500	2.5925	WIPA	100	Active	1	GKOP	m3	1.837200
3108	WCP00137	CORE PLYWOOD MULTIPLEX WBP 16x1220x2440	4.7629	SUP00075	PREMIX BONDTITE	550	WIPA	100	Active	2	GKOP	Kg	0.008700
3109	WCP00138	CORE PLYWOOD MULTIPLEX MRE 16x1220x2500	4.8800	WIV00434	VENEER SG 1.7x1220x2440	3.0366	WIPA	100	Active	0	WIVE	m3	1.607100
3110	WCP00138	CORE PLYWOOD MULTIPLEX MRE 16x1220x2500	4.8800	WIV00602	VENEER LG 1.7x1220x2500	2.5925	WIPA	100	Active	1	WIVE	m3	1.882400
3111	WCP00138	CORE PLYWOOD MULTIPLEX MRE 16x1220x2500	4.8800	SUP00099	PREMIX MRE-0 1020	550	WIPA	100	Active	2	SUPP	Kg	0.008900
3112	WCP00139	CORE PLYWOOD WBP 17.1x1245x2464	5.2457	WIV00434	VENEER SG 1.7x1220x2440	3.0366	WIPA	100	Active	0	GKOP	m3	1.727500
3113	WCP00139	CORE PLYWOOD WBP 17.1x1245x2464	5.2457	WIV00602	VENEER LG 1.7x1220x2500	2.5925	WIPA	100	Active	1	GKOP	m3	2.023400
3114	WCP00139	CORE PLYWOOD WBP 17.1x1245x2464	5.2457	SUP00075	PREMIX BONDTITE	529.5	WIPA	100	Active	2	GKOP	Kg	0.009900
3115	WCP00140	CORE PLYWOOD MULTIPLEX WBP 13.3x1220x2440	3.9591	WIV00434	VENEER SG 1.7x1220x2440	1.5183	WIPA	100	Active	0	GKOP	m3	2.607600
3116	WCP00140	CORE PLYWOOD MULTIPLEX WBP 13.3x1220x2440	3.9591	WIV00602	VENEER LG 1.7x1220x2500	2.074	WIPA	100	Active	1	GKOP	m3	1.908900
3117	WCP00140	CORE PLYWOOD MULTIPLEX WBP 13.3x1220x2440	3.9591	WIV00448	VENEER SG 1.7x1220x1220	1.012	WIPA	100	Active	2	GKOP	m3	3.912200
3118	WCP00140	CORE PLYWOOD MULTIPLEX WBP 13.3x1220x2440	3.9591	SUP00075	PREMIX BONDTITE	495	WIPA	100	Active	3	GKOP	Kg	0.008000
3119	WCP00141	CORE PLYWOOD MRE 28x1220x2440	8.3350	WIV00025	VENEER SG 2.6x1220x1220	5.418	WIPA	100	Active	0	GKOP	m3	1.538400
3120	WCP00141	CORE PLYWOOD MRE 28x1220x2440	8.3350	WIV00524	VENEER LG 2x1220x2500	3.66	WIPA	100	Active	1	GKOP	m3	2.277300
3121	WCP00141	CORE PLYWOOD MRE 28x1220x2440	8.3350	SUP00099	PREMIX MRE-0 1020	635.4	WIPA	100	Active	2	GKOP	Kg	0.013100
3122	WCP00142	CORE PLYWOOD MRE 38x1000x2400	9.1200	WIV00025	VENEER SG 2.6x1220x1220	6.966	WIPA	100	Active	0	GKOP	m3	1.309200
3123	WCP00142	CORE PLYWOOD MRE 38x1000x2400	9.1200	WIV00524	VENEER LG 2x1220x2500	4.88	WIPA	100	Active	1	GKOP	m3	1.868900
3124	WCP00142	CORE PLYWOOD MRE 38x1000x2400	9.1200	SUP00099	PREMIX MRE-0 1020	847.2	WIPA	100	Active	2	GKOP	Kg	0.010800
3125	WCP00143	CORE PLYWOOD MRE 48x1220x2440	14.2886	WIV00025	VENEER SG 2.6x1220x1220	8.514	WIPA	100	Active	0	GKOP	m3	1.678200
3126	WCP00143	CORE PLYWOOD MRE 48x1220x2440	14.2886	WIV00524	VENEER LG 2x1220x2500	6.1	WIPA	100	Active	1	GKOP	m3	2.342400
3127	WCP00143	CORE PLYWOOD MRE 48x1220x2440	14.2886	SUP00099	PREMIX MRE-0 1020	1059	WIPA	100	Active	2	GKOP	Kg	0.013500
3128	WCP00144	CORE PLYWOOD MRE 16.3x920x2135	3.2016	WIV00008	VENEER SG 2x930x2150	1.9995	WIPA	100	Active	0	GKOP	m3	1.601200
3129	WCP00144	CORE PLYWOOD MRE 16.3x920x2135	3.2016	WIV00263	VENEER LG 2x930x2300	1.7112	WIPA	100	Active	1	GKOP	m3	1.871000
3130	WCP00144	CORE PLYWOOD MRE 16.3x920x2135	3.2016	SUP00073	PREMIX UL MRE-1	423.6	WIPA	100	Active	2	GKOP	Kg	0.007600
3131	WCP00145	CORE PLYWOOD MRE 14.5x1225x2445	4.3429	WIV00032	VENEER SG 2.6x1220x2440	1.548	WIPA	100	Active	0	GKOP	m3	2.805500
3132	WCP00145	CORE PLYWOOD MRE 14.5x1225x2445	4.3429	WIV00524	VENEER LG 2x1220x2500	1.83	WIPA	100	Active	1	GKOP	m3	2.373200
3133	WCP00145	CORE PLYWOOD MRE 14.5x1225x2445	4.3429	WIV00025	VENEER SG 2.6x1220x1220	1.548	WIPA	100	Active	2	GKOP	m3	2.805500
3134	WCP00145	CORE PLYWOOD MRE 14.5x1225x2445	4.3429	SUP00099	PREMIX MRE-0 1020	317.7	WIPA	100	Active	3	GKOP	Kg	0.013700
3135	WCP00146	CORE PLYWOOD WBP 6x1220x2500	2.4400	WIV00015	VENEER SG 2x1220x2440	1.1908	WIPA	100	Active	0	GKOP	m3	2.049000
3136	WCP00146	CORE PLYWOOD WBP 6x1220x2500	2.4400	WIV00077	VENEER LG 2.6x1220x2440	0.774	WIPA	100	Active	1	GKOP	m3	3.152500
3137	WCP00146	CORE PLYWOOD WBP 6x1220x2500	2.4400	SUP00075	PREMIX BONDTITE	99	WIPA	100	Active	2	GKOP	Kg	0.024600
3138	WCP00147	CORE PLYWOOD WBP 8x1220x2500	2.4400	WIV00015	VENEER SG 2x1220x2440	1.7862	WIPA	100	Active	0	GKOP	m3	1.366000
3139	WCP00147	CORE PLYWOOD WBP 8x1220x2500	2.4400	WIV00530	VENEER LG 1.3x1220x2500	0.793	WIPA	100	Active	1	GKOP	m3	3.076900
3140	WCP00147	CORE PLYWOOD WBP 8x1220x2500	2.4400	SUP00075	PREMIX BONDTITE	198	WIPA	100	Active	2	GKOP	Kg	0.012300
3141	WCP00148	CORE PLYWOOD WBP 10x1220x2500	3.0500	WIV00015	VENEER SG 2x1220x2440	1.7862	WIPA	100	Active	0	GKOP	m3	1.707500
3142	WCP00148	CORE PLYWOOD WBP 10x1220x2500	3.0500	WIV00590	VENEER LG 2.6x1220x2500	1.586	WIPA	100	Active	1	GKOP	m3	1.923100
3143	WCP00148	CORE PLYWOOD WBP 10x1220x2500	3.0500	SUP00075	PREMIX BONDTITE	198	WIPA	100	Active	2	GKOP	Kg	0.015400
3144	WCP00149	CORE PLYWOOD WBP 13x1220x2500	3.9650	WIV00015	VENEER SG 2x1220x2440	2.3816	WIPA	100	Active	0	GKOP	m3	1.664800
3145	WCP00149	CORE PLYWOOD WBP 13x1220x2500	3.9650	WIV00524	VENEER LG 2x1220x2500	1.83	WIPA	100	Active	1	GKOP	m3	2.166700
3146	WCP00149	CORE PLYWOOD WBP 13x1220x2500	3.9650	SUP00075	PREMIX BONDTITE	297	WIPA	100	Active	2	GKOP	Kg	0.013400
3147	WCP00150	CORE PLYWOOD WBP 16x1220x2500	4.8800	WIV00015	VENEER SG 2x1220x2440	2.977	WIPA	100	Active	0	GKOP	m3	1.639200
3148	WCP00150	CORE PLYWOOD WBP 16x1220x2500	4.8800	WIV00524	VENEER LG 2x1220x2500	2.44	WIPA	100	Active	1	GKOP	m3	2.000000
3149	WCP00150	CORE PLYWOOD WBP 16x1220x2500	4.8800	SUP00075	PREMIX BONDTITE	396	WIPA	100	Active	2	GKOP	Kg	0.012300
3150	WCP00151	CORE PLYWOOD WBP 23x1220x2500	7.0150	WIV00032	VENEER SG 2.6x1220x2440	2.322	WIPA	100	Active	0	GKOP	m3	3.021100
3151	WCP00151	CORE PLYWOOD WBP 23x1220x2500	7.0150	WIV00524	VENEER LG 2x1220x2500	2.44	WIPA	100	Active	1	GKOP	m3	2.875000
3152	WCP00151	CORE PLYWOOD WBP 23x1220x2500	7.0150	WIV00011	VENEER SG 2x1220x1220	0.8931	WIPA	100	Active	2	GKOP	m3	7.854700
3153	WCP00151	CORE PLYWOOD WBP 23x1220x2500	7.0150	SUP00075	PREMIX BONDTITE	495	WIPA	100	Active	3	GKOP	Kg	0.014200
3154	WCP00152	CORE PLYWOOD WBP 28x1220x2500	8.5400	WIV00015	VENEER SG 2x1220x2440	4.1678	WIPA	100	Active	0	GKOP	m3	2.049000
3155	WCP00152	CORE PLYWOOD WBP 28x1220x2500	8.5400	WIV00590	VENEER LG 2.6x1220x2500	4.758	WIPA	100	Active	1	GKOP	m3	1.794900
3156	WCP00152	CORE PLYWOOD WBP 28x1220x2500	8.5400	SUP00075	PREMIX BONDTITE	594	WIPA	100	Active	2	GKOP	Kg	0.014400
\.


--
-- TOC entry 5140 (class 0 OID 278540)
-- Dependencies: 228
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, customer_code, customer_name) FROM stdin;
39	CE00001	PARA ANTO W
40	CE00002	KARYAWAN
41	CE00003	MUNTASIR
42	CE00004	SERAGAM KARYAWAN
43	CE00005	SLAMET HERI P
44	CE00006	KUKUH HIMAWAN
45	CE00007	MR. PAUL
46	CE00008	JUNI HARJONO
47	CE00009	ARWIDSON WIDAYAT P
48	CE00010	A. M. MUZANI
49	CE00011	SLAMET SARWO EDI
50	CE00012	PAK KABUL PRM
51	CE00013	YULIANTO PRM
52	CE00014	BAMBANG DRIVER
53	CE00015	MASRUR PRM
54	CE00016	AFKIR LOG
55	CE00017	BUANG SUMADI
56	CE00018	IMAM SOBIRIN
57	CE00019	DWI UTOMO
58	CE00020	YERI DWI H
59	CE00021	BUTUK SLAMET
60	CE00022	NURHADI
61	CE00023	DWI SISWANTO
62	CE00024	KASBON HRD
63	CE00025	KASBON PRM
64	CE00026	KASBON PSM
65	CE00027	KASBON UMUM LAIN-LAIN
66	CE00028	ALAM BAYU DEWO
67	CE00029	YUDHI NUGROHO
68	CE00030	KOPERASI KARYAWAN
69	CE00031	ALI HASANUDIN HRD
70	CE00032	AHMAD NUR SALIM (PPIC)
71	CE00033	PAMUJI WALUYO JATI
72	CE00034	PAULINA LIANA
73	CE00035	EKA YULIANTI (HRD)
74	CE00036	PAK SODIKIN
75	CE00037	RUDIYANTO ASSEMBLY
76	CE00038	PACIFIC RING INC
77	CE00039	ACHMAD KHUSAENI
78	CE00040	SURYATI (FAT)
79	CE00041	WARSONO (TEKNIK)
80	CE00042	FUADIN (TEKNIK)
81	CE00043	MASFUFI (TEKNIK)
82	CE00044	SOLEKHAN (TEKNIK)
83	CE00045	DIDIK SUPRIYADI (PPIC)
84	CE00046	BAYU PRASETYO (WHS)
85	CE00047	TANTRI ANGGRAINI
86	CE00048	KASBON HRD KENDARAAN
87	CE00049	SIDNEY WILLIAM ROUSTON
88	CE00050	WENDY FERDIYANA
89	CE00051	ALCORSE JULIO CESAR
90	CE00052	SAFAATUN HIDAYAH
91	CI00001	ALBASIA BHUMIPHALA PERSADA, PT
92	CL00001	COUNTRY FORM FURNITURE, PT
93	CL00002	CORINTHIAN INDUSTRIES INDONESIA, PT
94	CL00003	EURO-DESIGN, PT
95	CL00004	FURNINDO UTAMA ASIA, PT
96	CL00005	HADINATA BROTHERS, PT
97	CL00006	CEGEONE, PT
98	CL00007	KAMPOENG DJATI, PT
99	CL00008	KARYA SUTARINDO, PT
100	CL00009	DECORUS, CV
101	CL00010	INAX INTERNATIONAL, PT
102	CL00011	IDE STUDIO, PT
103	CL00012	EURASIA WOODWORKING, PT
104	CL00013	SUKSES JAYA, CV
105	CL00014	PK MULYO, CV
106	CL00015	DOMUSINDO
107	CL00016	KAYUBAGUS INTERNASIONAL, CV
108	CL00017	PHILNESIA INTERNATIONAL,PT
109	CL00018	INDOHO SANTOSA ABADI, PT
110	CL00019	AST INDONESIA, PT
111	CL00020	CORINTHIAN INDUSTRIES INDONESIA, PT
112	CL00021	PALLISER INDONESIA,PT
113	CL00022	MUDJIONO
114	CL00023	SUROTO
115	CL00024	MOCHAMAD SYAEFUDIN
116	CL00025	KIRANA ADHITAMA ARSITEK, PT
117	CL00026	MONA ADI JAYA, PT
118	CL00027	FURNITURE DIRECT, PT
119	CL00028	SUHARTONO
120	CL00029	ARJUNA UTAMA KIMIA, PT
121	CL00031	GLOBAL INFINITY MAKMUR, PT
122	CL00032	CATUR ARIEF WICAKSONO
123	CL00033	MUTUAGUNG LESTARI, PT
124	CL00034	FAR EAST SEATING, PT
125	CL00035	Y. DARYANTO
126	CL00036	HARRISON AND GIL JAVA. PT
127	CL00037	MEBEL INTERNATIONAL. CV
128	CL00038	EASTERN LIVING INTERNATIONAL
129	CL00039	JANSEN INDONESIA, PT
130	CL00040	ALBASIA BHUMIPHALA PERSADA, PT
131	CL00041	JAVA WOOD INDUSTRI, PT
132	CN00001	DACHSER INDONESIA, PT
133	CN00002	SEMBADA, UD
134	CN00003	SUGIYOTO
135	CN00004	JANGKAR PACIFIC
136	CN00005	MACOLINE INDONESIA, PT
137	CN00006	HARIAN
138	CN00007	DUA PUTRI, UD
139	CN00008	CHALID MAWARDI
140	CN00009	FM GLOBAL LOGISTICS, PT
141	CN00010	KERRY LOGISTICS INDONESIA, PT.
142	CN00011	SUHARTONO
143	CN00012	ARJUNA UTAMA KIMIA, PT
144	CN00013	MUTUAGUNG LESTARI, PT
145	CN00014	KAMPOENG DJATI, PT
146	CN00015	FAR EAST SEATING, PT
147	CN00016	PALLISER INDONESIA,PT
148	CN00017	CORINTHIAN INDUSTRIES INDONESIA, PT
149	CN00018	TUMAC LUMBER CO.
150	CN00019	INTERGLOBAL FOREST
151	CN00020	SHELTER FOREST INTERNATIONAL
152	CN00021	MEBEL INTERNATIONAL
153	CN00022	HARDWOODS SPECIALTY PRODUCTS LP
154	CN00023	MUHAMMAD HASAN
155	CN00024	Y RISNANDA WIJAYA
156	CN00025	MR. MINYU HO
157	CN00026	SURFACTOR ASIA PACIFIC SDN. BHD.
158	CN00027	KASE INTERNATIONAL, PT
159	CN00028	Bp. SURANTO
160	CN00029	INDAH FITRIANI
161	CN00030	HARDWOODS SPLP
162	CN00031	TIMTRADE SRL
163	CN00032	HARDWOODS SPECIALTY PRODUCT USLP
164	CN00033	HOME PILLARS GROUP LTD
165	CN00034	MDK ASIA SDN. BHD
166	CN00035	BERKAH RIZKI CV
167	CN00036	FRANK PAXTON LUMBER COMPANY
168	CN00037	COASTWOOD FURNITURE
169	CN00038	DIXIE PLYWOOD COMPANY
170	CN00039	JACOB JUERGENSEN WOOD GMBH
171	CN00040	PYRAMID TRADING
172	CN00041	FRD SHANGHAI
173	CN00042	LIBERTY WOODS INTERNATIONAL
174	CN00043	HARDWOODS PORTLAND
175	CN00044	SENSASI GUNA TERUTAMA, PT
176	CN00045	MR TROY
177	CN00046	HARDWOODS SAN ANTONIO
178	CN00047	MR NASSER KAWASS
179	CN00048	MR. RAUL CAMEJO
180	CN00049	DIREKTUR JENDERAL INDUSTRI AGRO KEMENTERIAN PERINDUSTRIAN RI
181	CN00050	KURATLE & JAECKER AG
182	CN00053	PACIFIC RING EUROPE GMBH
183	CN00054	INAX INTERNASIONAL, PT
184	CN00055	DECOSPAN NV
185	CN00056	HARDWOODS SPECIALTY PRODUCTS
186	CN00057	JELDWEN UK
187	CN00058	BELHASA BUILDING MATERIALS TRADING LLC
188	CN00059	PLYWOOD AND MORE B.V.
189	CN00060	WOOD WANG XIAMEN SOUTH FORESTRY IMP & EXP. CO. LTD
190	CN00061	TEKNION
191	CN00062	KARYA SUTARINDO, PT
192	CN00063	SENGON RAHAYU. CV
193	CN00064	SHANDONG YUEQUN
194	CN00065	I.CO.L. S.r.l
195	CN00066	MJB WOOD
196	CN00067	INDO ARIA. UD
197	CN00068	RICHWISE AUSTRALIA
198	CN00069	ROBERT WEED CORPORATION
199	CN00070	suhart
200	CN00071	MJB WOOD MEXICO
201	CN00072	PIJAR SUKMA
202	CN00073	COPPICE
203	CN00074	AL KUHAIMI GROUP
204	CN00075	SWARTLAND INVESTMENTS (PTY) LTD
205	CN00076	SINGGIH PANGESTIAWAN
206	CN00077	DIXIE WEST PALM BEACH
207	CN00078	WIRATAMA INTI SENTOSA. PT
208	CN00079	SLAMET KHALIMI
209	CN00080	EASTER LIVING INTERNATIONAL
210	CN00081	BERCO 5
211	CN00082	DESA SURODADI KEC. GRINGSING
212	CN00083	HAMPTON LUMBER
213	CN00084	FRIEDRICH KLUMPP WOODCOATINGS INDONESIA PT.
214	CN00085	PACIFIC RING GLOBAL FZCO
215	CN00086	INDUSTRIAL TIMBER
216	CN00087	INTERGLOBAL FOREST
217	CN00088	COPPICE
218	CN00089	FRD GROUP
219	CN00090	WALKER GLASS INTERNATIONAL. PT
220	CN00091	IDE STUDIO INDONESIA
221	CN00092	NORTH AMERICAN PLYWOOD
222	CN00093	WESTON WOOD SOLUTIONS
223	CN00094	DOVER CHEMICAL, PT
224	CN00095	ALBASIA BHUMIPHALA PERSADA, PT
225	CN00096	FRD GROUP SHANGHAI CO., LTD.
226	CN00097	HOME HARDWARE
227	CN00098	HARDWOODS VANCOUVER
228	CN00099	MULTI MANAO INDONESIA, PT
229	CN00100	SEEMAC INC
230	CN00101	HECNY BAHARI INDONESIA, PT
231	CN00102	JANSEN INDONESIA, PT
232	CN00103	HOOD DISTRIBUTION
233	CN00104	UNITED ENGINEERING CONSTRUCTION (UNEC)
234	CN00105	VOEHRINGER GMBH & CO. KG
235	CN00106	SIMPSON DOOR
236	CN00107	DECKED
237	CN00108	HARDWOODS CALGARY
238	CN00109	PINETEC PROPRIETARY LIMITED
239	CN00110	MAKMUR FANTAWIJAYA CHEMICAL INDUSTRIES, PT
240	CN00111	DIXIE PLYWOOD CHARLOTTE
241	CN00112	DIXIE TANPA
242	CN00113	INDOHO SANTOSA ABADI
243	CN00114	HARDWOODS WINNIPEG
244	CN00115	MARION MOULDING
245	CN00116	WESTON WOOD SOLUTIONS INC.
246	CN00117	MOBICAN
247	CN00118	ACME INTERNATIONAL (THAILAND) LIMITED
248	CN00119	MANHATTAN DOOR
249	CN00120	APEXA TRADING LLC
250	CN00121	KARYA CIPTA UNGGUL NUSANTARA, PT
251	CN00122	SKAPE PANELS LTD. C/- ECKO FASTENING SYSTEM
252	CN00123	WOOD INTERNATIONAL AGENCY LIMITED
253	CN00124	ALI HASANUDIN
254	CN00125	KAK
255	CN00126	PACIFIC RING INCORPORATED
256	CS00001	SUYITNO ASSEMBLY (SF)
257	CS00002	AHMAD TEGUH SUSANTO ASSEMBLY (SF)
258	CS00003	SODIKIN FINISHING (SF)
259	CS00004	MULYONO FINISHING (SF)
260	CS00005	NURYADI FINISHING (SF)
261	CS00006	MUH. ZAIDIN RIDWAN QC (SF)
262	CS00007	AKHMAD THOHIRIN QC (SF)
263	CS00008	ALI KHAFIFUDIN QC (SF)
264	CS00009	ARIF WIJAYANTO QC (SF)
265	CS00010	AHMAD NUR FAJRIN QC (SF)
266	CS00011	ADHI SETIAWAN FI (SF)
267	CS00012	SUBAEDI PEMBAHANAN (SF)
268	CS00013	TRIYONO HARMOKO PEMBAHANAN (SF)
269	CS00014	HERMAWAN PEMBAHANAN (SF)
270	CS00015	MUHAMAD KURNIAWAN PEMBAHANAN (SF)
271	CS00016	MUHAMMAD SIYAM PEMBAHANAN (SF)
272	CS00017	M ABDUL MUKHID PEMBAHANAN (SF)
273	CS00018	MUTHOHIRIN WHS (SF)
274	CS00019	DARYOTO WHS (SF)
275	CS00020	AGUS BONAWAR ASSEMBLY (SF)
276	CS00021	RICHAN IRFANDI FINISHING (SF)
277	CS00022	ZAENAL ARIFIN ASSEMBLY (SF)
278	CS00023	UNTUNG PRASETYO QC (SF)
279	CS00024	PURWOKO QC (SF)
280	CS00025	EDI PURWANTO WHS (SF)
281	CS00026	HADI PRAYITNO PEMBAHANAN (SF)
282	CS00027	BAYU PRASETYO WHS (SF)
283	CS00028	AHMAD MASYKUR CORE BOARD & VAF (SF)
284	CS00029	RUDIYANTO ASSEMBLY (SF)
285	CT00001	ASAP TRADING PTY,LTD
286	CT00002	DIXIE PLYWOOD AND LUMBER
287	CT00003	HAMPTON LUMBER SALES
288	CT00004	INTERGLOBAL FOREST
289	CT00005	PACIFIC RING INC
290	CT00006	COUNTRY FORM FURNITURE, PT
291	CT00007	EURO-DESIGN, PT
292	CT00008	CEGEONE, PT
293	CT00009	KAMPOENG DJATI, PT
294	CT00010	PALLISER INDONESIA,PT
295	CT00011	SUROTO
296	CT00012	SUHARTONO
297	CT00013	SUKSES JAYA, CV
298	CT00014	EGR DECOR CO.,LTD
299	CT00015	INAX INTERNATIONAL, PT
300	CT00016	KARYA SUTARINDO, PT
301	CT00017	DECOSPAN NV
302	CT00018	HARRISON AND GIL JAVA. PT
303	CT00019	EASTERN LIVING INTERNATIONAL
304	CT00020	PACIFIC RING EUROPE GMBH
305	CT00021	FALCON TIMBER LTD.
306	CT00022	UNIVERSAL PLYWOOD (PTY) LTD
307	CT00023	GABARRO HNOS. S. A.
308	CT00024	ROSE WOOD BUILDING MATERIALS TRADING LLC
309	CT00025	JELD-WEN AUSTRALIA PTY LIMITED
310	CT00026	UGARIT INTERNATIONAL FURNITURE MFG.
311	CT00027	PACIFIC RING GLOBAL FZCO
312	CX00001	FRANK PAXTON LUMBER COMPANY-CHICAGO
313	CX00002	PACIFIC RING EUROPE GMBH
314	CX00003	FOREST ONE AUSTRALIA PTY LTD
315	CX00004	PINETEC PROPRIETARY LIMITED
316	CX00006	TABLEROS Y CHAPAS DE JALISCO SA DE CV
317	CX00007	DIXIE PLYWOOD COMPANY
318	CX00008	WOODEXINC
319	CX00009	MYWOODWALL INC.
320	CX00010	DAIKEN CORPORATION
321	CX00011	HAMPTON LUMBER SALES
322	CX00012	IKE TRADING CO LTD
323	CX00013	JUTRAS DISTRIBUTION INTERNATIONALE
324	CX00014	HARDWOODS SPECIALTY PRODUCTS USLP
325	CX00015	HARDWOODS SPECIALTY PRODUCTS LP
326	CX00016	ROBERT WEED CORPORATION
327	CX00017	AL NOOH WOOD DESIGN W.L.L
328	CX00018	ARCHON INC BUILDING MATERIALS TRADING LLC
329	CX00019	BELHASA BUILDING MATERIALS TRADING LLC
330	CX00020	COMPOSITE TECHNOLOGY INTERNATIONAL LIMITED
331	CX00021	DANUBE BUILDING MATERIALS FZCO
332	CX00022	FALCON PANEL PRODUCTS
333	CX00023	F.W.BARTH & CO. GMBH
334	CX00024	GULF CRAFT L.L.C
335	CX00025	INTERGLOBAL FOREST
336	CX00026	JACOB JUERGENSEN WOOD GMBH
337	CX00027	PLYWOOD AND MORE B.V.
338	CX00028	RAMKOR INTERNATIONAL LTD
339	CX00029	SWL TISCHLERPLATTEN BETRIEBS - GMBH
340	CX00030	UNIVERSAL PLYWOOD (PTY) LTD
341	CX00031	URI GROSS LTD
342	CX00032	HARDWOODS MINNEAPOLIS
343	CX00033	PAUL HOROSZOWSKI
344	CX00034	WESTON WOOD CHINA
345	CX00035	SHELTER FOREST INTERNATIONAL
346	CX00036	MENARD BUYING OFFICE
347	CX00037	SHELTER FOREST INTERNATIONAL
348	CX00038	TUMAC LUMBER COMPANY INC.
349	CX00039	HOUSEBOAT-WOMA
350	CX00040	UGARIT INTERNATIONAL FURNITURE MFG.
351	CX00041	DECOR 8 SIAM CO, LTD
352	CX00042	MAX I&T CORPORATION
353	CX00043	MATT MAGUIRE
354	CX00044	WOOD WANG
355	CX00045	VIKING YACTHS
356	CX00046	SHREEJI WOODCRAFT PVT.LTD.
357	CX00047	WOMA KNAJDEK MEBLE Sp.z.o.o
358	CX00048	CNC Global Co.,Ltd.
359	CX00049	CARL GOETZ GMBH
360	CX00050	ASAP TRADING PTY,LTD
361	CX00051	DIXIE PLYWOOD & LUMBER CO OF ATLANTA
362	CX00052	STEVES AND SONS, INC
363	CX00053	EGR DECOR CO.,LTD
364	CX00054	DANUBE BLDG MTRLS BAHRAIN CO LLC
365	CX00055	SMART WOOD CORP
366	CX00056	ZENNARO LEGNAMI S.R.L
367	CX00057	MADERAS J. REDONDO S.L
368	CX00058	SCHIFINO LEGNAMI SPA
369	CX00059	NORTHANN DISTRIBUTION CENTER, INC
370	CX00060	KEGRO DEUREN B.V.
371	CX00061	UNIVERSAL PLYWOOD (PTY) LTD
372	CX00062	NORD COMPENSATI S.R.L
373	CX00063	BASSO LEGNAMI S.R.L.
374	CX00064	HARDWOODS USLP-RENTON
375	CX00065	GPD GIATA PROFILES & DOORS AE
376	CX00066	HAMPTON LUMBER
377	CX00067	MADERAS MEDINA S.L
378	CX00068	TAMALSA EUROPA S.L.
379	CX00069	HARDWOODS SPECIALTY PRODUCTS
380	CX00070	FALCON TIMBER LTD.
381	CX00071	WOOD INTERNATIONAL AGENCY LIMITED
382	CX00072	KURATLE & JAECKER AG
383	CX00073	DCR GROUP CO., LTD.
384	CX00074	GABARRO HNOS. S. A.
385	CX00075	ALHASA BUILDING MATERIALS TRADING
386	CX00076	DECOSPAN NV
387	CX00077	COPPICE COMMODITIES LLC
388	CX00078	PACIFIC RING GLOBAL FZCO
389	CX00079	DAIKEN
390	CX00080	GER VIETNAM CO., LTD
391	CX00081	PV WOOD CO., LTD
392	CX00082	ROSE WOOD BUILDING MATERIALS TRADING LLC
393	CX00083	JABERI WOODEN FACTORIES WLL
394	CX00084	SUNREEF YACHTS RMC FZC
395	CX00085	MURPHY HARDWOOD PLYWOOD
396	CX00086	CORA DOMENICO & FIGLI S.P.A
397	CX00087	PAGANONI LEGNAMI S.P.A.
398	CX00088	SEEMAC, INCORPORATED
399	CX00089	GREAT LAKES LAMINATION
400	CX00090	LP GROUP S.R.L.
401	CX00091	PACIFIC RING INCORPORATED
402	CX00092	DIXIE PLYWOOD AND LUMBER COMPANY
403	CX00093	UNITED ENGINEERING CONSTRUCTION (UNEC) FOR WOOD WORKS & DECOR FACTORY, LLC
404	CX00094	MILLENNIUM INTERNATIONAL LTD
405	CX00095	PETERMAN LUMBER, INC
406	CX00096	DECKED, LLC.
407	CX00097	AMORELLI FRANCESCO & C. S.R.L.
408	CX00098	TABLEROS Y PUERTAS MORENO S.L.
409	CX00099	DANUBE BUILDING MATERIALS FZE
410	CX00100	ALDANUBE BUILDING MATERIALS L.L.C.
411	CX00101	IMOLA LEGNO S.P.A.
412	CX00102	SIPAN S.R.L.
413	CX00103	GASPARE MIRRIONE S.P.A.
414	CX00104	DOTFLOOR INC
\.


--
-- TOC entry 5158 (class 0 OID 344375)
-- Dependencies: 246
-- Data for Name: demand_item_assembly; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.demand_item_assembly (id, demand_id, demand_item_id, item_id, item_code, description, uom, total_qty, pcs, production_schedule, warehouse, created_at) FROM stdin;
109	442	783	122	FGD00505	[PANNEL] DOORCORE MRE 30x1100x2400	M3	52.91	668.00	[{"date": "2026-03-10", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-11", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-12", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-13", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-14", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-15", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-16", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-17", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-18", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-19", "shifts": {"shift1": {"qty": 88, "type": "assembly", "active": true}, "shift2": {"qty": 116, "type": "assembly", "active": true}, "shift3": {"qty": 116, "type": "assembly", "active": true}}}, {"date": "2026-03-20", "shifts": {"shift1": {"qty": 116, "type": "assembly", "active": true}, "shift2": {"qty": 116, "type": "assembly", "active": true}, "shift3": {"qty": 116, "type": "assembly", "active": true}}}, {"date": "2026-03-21", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-22", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-23", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-24", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-25", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-26", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-27", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-28", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-29", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-30", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}]	\N	2026-04-20 10:29:21.221307
110	442	783	122	WCD00109	[CORE] CORE DOORCORE MRE 26x1100x2400	M3	52.91	668.00	[{"date": "2026-03-10", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-11", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-12", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-13", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-14", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-15", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-16", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-17", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-18", "shifts": {"shift1": {"qty": 164, "type": "assembly", "active": true}, "shift2": {"qty": 168, "type": "assembly", "active": true}, "shift3": {"qty": 168, "type": "assembly", "active": true}}}, {"date": "2026-03-19", "shifts": {"shift1": {"qty": 168, "type": "assembly", "active": true}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-20", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-21", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-22", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-23", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-24", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-25", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-26", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-27", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-28", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-29", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}, {"date": "2026-03-30", "shifts": {"shift1": {"qty": 0, "type": "assembly", "active": false}, "shift2": {"qty": 0, "type": "assembly", "active": false}, "shift3": {"qty": 0, "type": "assembly", "active": false}}}]	\N	2026-04-20 10:29:21.221307
\.


--
-- TOC entry 5156 (class 0 OID 344286)
-- Dependencies: 244
-- Data for Name: demand_item_finishing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.demand_item_finishing (id, demand_id, demand_item_id, item_id, item_code, description, uom, total_qty, pcs, production_schedule, created_at) FROM stdin;
338	442	783	122	FGD00506	FG DOORCORE MRE 30x1100x2400	M3	52.91	668.00	[{"date": "2026-03-10", "shifts": {"shift1": {"qty": 0, "type": "finishing", "active": false}, "shift2": {"qty": 0, "type": "finishing", "active": false}, "shift3": {"qty": 0, "type": "finishing", "active": false}}}, {"date": "2026-03-11", "shifts": {"shift1": {"qty": 0, "type": "finishing", "active": false}, "shift2": {"qty": 0, "type": "finishing", "active": false}, "shift3": {"qty": 0, "type": "finishing", "active": false}}}, {"date": "2026-03-12", "shifts": {"shift1": {"qty": 0, "type": "finishing", "active": false}, "shift2": {"qty": 0, "type": "finishing", "active": false}, "shift3": {"qty": 0, "type": "finishing", "active": false}}}, {"date": "2026-03-13", "shifts": {"shift1": {"qty": 0, "type": "finishing", "active": false}, "shift2": {"qty": 0, "type": "finishing", "active": false}, "shift3": {"qty": 0, "type": "finishing", "active": false}}}, {"date": "2026-03-14", "shifts": {"shift1": {"qty": 0, "type": "finishing", "active": false}, "shift2": {"qty": 0, "type": "finishing", "active": false}, "shift3": {"qty": 0, "type": "finishing", "active": false}}}, {"date": "2026-03-15", "shifts": {"shift1": {"qty": 0, "type": "finishing", "active": false}, "shift2": {"qty": 0, "type": "finishing", "active": false}, "shift3": {"qty": 0, "type": "finishing", "active": false}}}, {"date": "2026-03-16", "shifts": {"shift1": {"qty": 0, "type": "finishing", "active": false}, "shift2": {"qty": 0, "type": "finishing", "active": false}, "shift3": {"qty": 0, "type": "finishing", "active": false}}}, {"date": "2026-03-17", "shifts": {"shift1": {"qty": 0, "type": "finishing", "active": false}, "shift2": {"qty": 0, "type": "finishing", "active": false}, "shift3": {"qty": 0, "type": "finishing", "active": false}}}, {"date": "2026-03-18", "shifts": {"shift1": {"qty": 0, "type": "finishing", "active": false}, "shift2": {"qty": 0, "type": "finishing", "active": false}, "shift3": {"qty": 0, "type": "finishing", "active": false}}}, {"date": "2026-03-19", "shifts": {"shift1": {"qty": 0, "type": "finishing", "active": false}, "shift2": {"qty": 0, "type": "finishing", "active": false}, "shift3": {"qty": 0, "type": "finishing", "active": false}}}, {"date": "2026-03-20", "shifts": {"shift1": {"qty": 0, "type": "finishing", "active": false}, "shift2": {"qty": 0, "type": "finishing", "active": false}, "shift3": {"qty": 0, "type": "finishing", "active": false}}}, {"date": "2026-03-21", "shifts": {"shift1": {"qty": 0, "type": "finishing", "active": false}, "shift2": {"qty": 0, "type": "finishing", "active": false}, "shift3": {"qty": 0, "type": "finishing", "active": false}}}, {"date": "2026-03-22", "shifts": {"shift1": {"qty": 0, "type": "finishing", "active": false}, "shift2": {"qty": 0, "type": "finishing", "active": false}, "shift3": {"qty": 0, "type": "finishing", "active": false}}}, {"date": "2026-03-23", "shifts": {"shift1": {"qty": 38, "type": "finishing", "active": true}, "shift2": {"qty": 90, "type": "finishing", "active": true}, "shift3": {"qty": 90, "type": "finishing", "active": true}}}, {"date": "2026-03-24", "shifts": {"shift1": {"qty": 90, "type": "finishing", "active": true}, "shift2": {"qty": 90, "type": "finishing", "active": true}, "shift3": {"qty": 90, "type": "finishing", "active": true}}}, {"date": "2026-03-25", "shifts": {"shift1": {"qty": 90, "type": "finishing", "active": true}, "shift2": {"qty": 90, "type": "finishing", "active": true}, "shift3": {"qty": 0, "type": "finishing", "active": false}}}, {"date": "2026-03-26", "shifts": {"shift1": {"qty": 0, "type": "finishing", "active": false}, "shift2": {"qty": 0, "type": "finishing", "active": false}, "shift3": {"qty": 0, "type": "finishing", "active": false}}}, {"date": "2026-03-27", "shifts": {"shift1": {"qty": 0, "type": "finishing", "active": false}, "shift2": {"qty": 0, "type": "finishing", "active": false}, "shift3": {"qty": 0, "type": "finishing", "active": false}}}, {"date": "2026-03-28", "shifts": {"shift1": {"qty": 0, "type": "finishing", "active": false}, "shift2": {"qty": 0, "type": "finishing", "active": false}, "shift3": {"qty": 0, "type": "finishing", "active": false}}}, {"date": "2026-03-29", "shifts": {"shift1": {"qty": 0, "type": "finishing", "active": false}, "shift2": {"qty": 0, "type": "finishing", "active": false}, "shift3": {"qty": 0, "type": "finishing", "active": false}}}, {"date": "2026-03-30", "shifts": {"shift1": {"qty": 0, "type": "finishing", "active": false}, "shift2": {"qty": 0, "type": "finishing", "active": false}, "shift3": {"qty": 0, "type": "finishing", "active": false}}}]	2026-04-20 10:29:14.855068
\.


--
-- TOC entry 5154 (class 0 OID 294933)
-- Dependencies: 242
-- Data for Name: demand_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.demand_items (id, demand_id, item_id, item_code, total_qty, production_schedule, created_at, description, uom, pcs) FROM stdin;
783	442	122	FGD00484	52.91	[{"date": "2026-03-17", "shifts": {"shift1": {"qty": 0, "active": false}, "shift2": {"qty": 0, "active": false}, "shift3": {"qty": 0, "active": false}}}, {"date": "2026-03-18", "shifts": {"shift1": {"qty": 0, "active": false}, "shift2": {"qty": 0, "active": false}, "shift3": {"qty": 0, "active": false}}}, {"date": "2026-03-19", "shifts": {"shift1": {"qty": 0, "active": false}, "shift2": {"qty": 0, "active": false}, "shift3": {"qty": 0, "active": false}}}, {"date": "2026-03-20", "shifts": {"shift1": {"qty": 0, "active": false}, "shift2": {"qty": 0, "active": false}, "shift3": {"qty": 0, "active": false}}}, {"date": "2026-03-21", "shifts": {"shift1": {"qty": 0, "active": false}, "shift2": {"qty": 0, "active": false}, "shift3": {"qty": 0, "active": false}}}, {"date": "2026-03-22", "shifts": {"shift1": {"qty": 0, "active": false}, "shift2": {"qty": 0, "active": false}, "shift3": {"qty": 0, "active": false}}}, {"date": "2026-03-23", "shifts": {"shift1": {"qty": 0, "active": false}, "shift2": {"qty": 0, "active": false}, "shift3": {"qty": 0, "active": false}}}, {"date": "2026-03-24", "shifts": {"shift1": {"qty": 0, "active": false}, "shift2": {"qty": 0, "active": false}, "shift3": {"qty": 0, "active": false}}}, {"date": "2026-03-25", "shifts": {"shift1": {"qty": 0, "active": false}, "shift2": {"qty": 0, "active": false}, "shift3": {"qty": 0, "active": false}}}, {"date": "2026-03-26", "shifts": {"shift1": {"qty": 0, "active": false}, "shift2": {"qty": 68, "active": true}, "shift3": {"qty": 150, "active": true}}}, {"date": "2026-03-27", "shifts": {"shift1": {"qty": 150, "active": true}, "shift2": {"qty": 150, "active": true}, "shift3": {"qty": 150, "active": true}}}, {"date": "2026-03-28", "shifts": {"shift1": {"qty": 0, "active": false}, "shift2": {"qty": 0, "active": false}, "shift3": {"qty": 0, "active": false}}}, {"date": "2026-03-29", "shifts": {"shift1": {"qty": 0, "active": false}, "shift2": {"qty": 0, "active": false}, "shift3": {"qty": 0, "active": false}}}, {"date": "2026-03-30", "shifts": {"shift1": {"qty": 0, "active": false}, "shift2": {"qty": 0, "active": false}, "shift3": {"qty": 0, "active": false}}}]	2026-04-20 09:07:52.032252	ALBASIA FALCATA DOORCORE MRE 30x1100x2400	M3	668.00
\.


--
-- TOC entry 5152 (class 0 OID 294924)
-- Dependencies: 240
-- Data for Name: demands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.demands (id, so_number, so_date, customer_name, delivery_date, production_date, created_at, has_schedule, is_generated, is_assembly_generated, is_finishing_generated) FROM stdin;
442	261000054	2026-02-23	UGARIT INTERNATIONAL FURNITURE MFG.	2026-03-30	2026-03-27	2026-04-20 09:07:52.032252	f	f	t	t
\.


--
-- TOC entry 5136 (class 0 OID 114712)
-- Dependencies: 224
-- Data for Name: grpo_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grpo_reports (id, tgl_grpo, tahun, bulan, entry_grpo, no_grpo, no_inv_sim, no_tally, no_ref_po, no_kedatangan, no_surat_jalan_vendor, kode_vendor, nama_vendor, rank, group_rotary, kode_item, description, qty_pcs_grpo, qty_grpo, price_per_m3, total_price_grpo, whs, status_grpo, kota_asal, asal_barang, slpcode, nama_grader, diameter, jenis_kayu, group_kayu, total_dia, code, created_at) FROM stdin;
16	2025-01-02	2025	Jan-2025	48	251000004	251000002	251000006	251000004	009/LG/01/2025	009/LG/01/2025	BB00146	KHANAFI	10	LOG 5 F	RML00076	LOG 130 ø24	90	5.292	940182.22	4975444.31	GLOG	Close	BATANG	TULIS	6	DWI SISWANTO	24.00	Albasia	LOG 130	2160.00	2025-01-03-LOG 5 F	2026-01-26 09:14:46.006802
20	2025-01-03	2025	Jan-2025	48	251000004	251000002	251000006	251000004	009/LG/01/2025	009/LG/01/2025	BB00146	KHANAFI	10	LOG 5 F	RML00079	LOG 130 ø27	54	4.018	1040412.24	4179960.22	GLOG	Close	BATANG	TULIS	6	DWI SISWANTO	27.00	Albasia	LOG 130	1458.00	2025-01-03-LOG 5 F	2026-01-27 08:50:51.093496
\.


--
-- TOC entry 5162 (class 0 OID 344465)
-- Dependencies: 250
-- Data for Name: item_assembly_core; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.item_assembly_core (id, assembly_code, description, warehouse, cycle_time_seconds, capacity_per_shift, updated_at, cycle_time) FROM stdin;
21	WCB00002	CORE BLOCKBOARD MRE 16x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
22	WCB00020	CORE BLOCKBOARD FJLC MRE 16x1220x2500	WIPA	0	168	2026-04-18 18:15:54.272684	200
23	WCB00021	CORE BLOCKBOARD FJLC MRE 37x1245x2200	WIPA	0	168	2026-04-18 18:15:54.272684	200
24	WCB00022	CORE BLOCKBOARD FJLC MRE 16x1245x2500	WIPA	0	168	2026-04-18 18:15:54.272684	200
25	WCD00001	CORE DOORCORE MRE 26x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
26	WCD00005	CORE DOORCORE MRE 30x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
27	WCD00006	CORE DOORCORE MRE 38x905x2095	WIPA	0	168	2026-04-18 18:15:54.272684	200
28	WCD00007	CORE DOORCORE MRE 38x915x2135	WIPA	0	168	2026-04-18 18:15:54.272684	200
29	WCD00008	CORE DOORCORE MRE 42x762x1981	WIPA	0	168	2026-04-18 18:15:54.272684	200
30	WCD00010	CORE DOORCORE MRE 42x915x2135	WIPA	0	168	2026-04-18 18:15:54.272684	200
31	WCD00011	CORE DOORCORE MRE 42x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
32	WCD00015	CORE DOORCORE MRE 42x920x2150	WIPA	0	168	2026-04-18 18:15:54.272684	200
33	WCD00016	CORE DOORCORE MRE 42x820x2150	WIPA	0	168	2026-04-18 18:15:54.272684	200
34	WCD00040	CORE DOORCORE MRE 33x920x2420	WIPA	0	168	2026-04-18 18:15:54.272684	200
35	WCD00047	CORE DOORCORE MRE 38x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
36	WCD00049	CORE DOORCORE MRE 42x838x2058	WIPA	0	168	2026-04-18 18:15:54.272684	200
37	WCD00050	CORE DOORCORE MRE 42x838x1981	WIPA	0	168	2026-04-18 18:15:54.272684	200
38	WCD00053	CORE DOORCORE MRE 36x932x2050	WIPA	0	168	2026-04-18 18:15:54.272684	200
39	WCD00058	CORE DOORCORE MRE 27x810x1810	WIPA	0	168	2026-04-18 18:15:54.272684	200
40	WCD00079	CORE DOORCORE MRE 42x915x2058	WIPA	0	168	2026-04-18 18:15:54.272684	200
41	WCD00083	CORE DOORCORE MRE 31x932x2300	WIPA	0	168	2026-04-18 18:15:54.272684	200
42	WCD00084	CORE DOORCORE MRE 36x932x2300	WIPA	0	168	2026-04-18 18:15:54.272684	200
43	WCD00086	CORE DOORCORE MRE 28x932x2300	WIPA	0	168	2026-04-18 18:15:54.272684	200
44	WCD00089	CORE DOORCORE MRE 33x830x2200	WIPA	0	168	2026-04-18 18:15:54.272684	200
45	WCD00108	CORE DOORCORE MRE 30x920x2150	WIPA	0	168	2026-04-18 18:15:54.272684	200
46	WCD00109	CORE DOORCORE MRE 26x1100x2400	WIPA	0	168	2026-04-18 18:15:54.272684	200
47	WCD00110	CORE DOORCORE MRE 42x1232x2451	WIPA	0	168	2026-04-18 18:15:54.272684	200
48	WCD00111	CORE DOORCORE FJLC MRE 42x1220x3048	WIPA	0	168	2026-04-18 18:15:54.272684	200
49	WCD00114	CORE DOORCORE FJLC MRE 42x1232x3061	WIPA	0	168	2026-04-18 18:15:54.272684	200
50	WCD00115	CORE DOORCORE RECONSTITUTED MRE 42x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
51	WCD00117	CORE DOORCORE MRE 26x932x2300	WIPA	0	168	2026-04-18 18:15:54.272684	200
52	WCD00118	CORE DOORCORE MRE 3 LAYER 38x915x2135	WIPA	0	168	2026-04-18 18:15:54.272684	200
53	WCD00119	CORE DOORCORE MRE 3 LAYER 42x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
54	WCD00121	CORE DOORCORE RECONSTITUTED MRE 30x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
55	WCD00122	CORE DOORCORE MRE 30x1232x2451	WIPA	0	168	2026-04-18 18:15:54.272684	200
56	WCD00124	CORE DOORCORE MRE 23x932x2300	WIPA	0	168	2026-04-18 18:15:54.272684	200
57	WCD00125	CORE DOORCORE RECONSTITUTED MRE 52x915x2135	WIPA	0	168	2026-04-18 18:15:54.272684	200
58	WCD00126	CORE DOORCORE RECONSTITUTED MRE 52x838x2040	WIPA	0	168	2026-04-18 18:15:54.272684	200
59	WCD00127	CORE DOORCORE RECONSTITUTED MRE 42x915x2135	WIPA	0	168	2026-04-18 18:15:54.272684	200
60	WCD00128	CORE DOORCORE MRE 28x1232x2451	WIPA	0	168	2026-04-18 18:15:54.272684	200
61	WCD00129	CORE DOORCORE MRE 34x1232x2451	WIPA	0	168	2026-04-18 18:15:54.272684	200
62	WCD00130	CORE DOORCORE MRE 40x1232x2451	WIPA	0	168	2026-04-18 18:15:54.272684	200
63	WCD00131	CORE DOORCORE MRE 38x830x2250	WIPA	0	168	2026-04-18 18:15:54.272684	200
64	WCL00009	CORE LVL F4 10x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
65	WCL00029	CORE LVL MRE 30x860x1967	WIPA	0	168	2026-04-18 18:15:54.272684	200
66	WCL00030	CORE LVL MRE 30x860x2267	WIPA	0	168	2026-04-18 18:15:54.272684	200
67	WCL00036	CORE LVL MRE 42x950x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
68	WCP00005	CORE PLYWOOD MDF MRE 12x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
69	WCP00009	CORE PLYWOOD MRE 21x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
70	WCP00012	CORE PLYWOOD MRE 18x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
71	WCP00021	CORE PLYWOOD MRE 10x1220x2500	WIPA	0	168	2026-04-18 18:15:54.272684	200
72	WCP00023	CORE PLYWOOD MRE 19x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
73	WCP00026	CORE PLYWOOD MULTIPLEX MRE 7x1220x2500	WIPA	0	168	2026-04-18 18:15:54.272684	200
74	WCP00034	CORE PLYWOOD COMBICORE WBP 14x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
75	WCP00059	CORE PLYWOOD MRE 3x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
76	WCP00076	CORE PLYWOOD MRE 10.3x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
77	WCP00077	CORE PLYWOOD MRE 7.3x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
78	WCP00078	CORE PLYWOOD MRE 13.3x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
79	WCP00079	CORE PLYWOOD MRE 16.3x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
80	WCP00082	CORE PLYWOOD MRE 4.3x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
81	WCP00100	CORE PLYWOOD WBP 10.3x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
82	WCP00102	CORE PLYWOOD WBP 16.3x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
83	WCP00113	CORE PLYWOOD WBP MULTIPLEX COMBICORE 10x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
84	WCP00114	CORE PLYWOOD WBP 14.3x1260x2500	WIPA	0	168	2026-04-18 18:15:54.272684	200
85	WCP00115	CORE PLYWOOD MRE 10.3x1220x2300	WIPA	0	168	2026-04-18 18:15:54.272684	200
86	WCP00117	CORE PLYWOOD COMBICORE MRE JABON 16.3x1232x2452	WIPA	0	168	2026-04-18 18:15:54.272684	200
87	WCP00120	CORE PLYWOOD MRE 14.5x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
88	WCP00121	CORE PLYWOOD WBP COMBICORE MULTIPLEX 16x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
89	WCP00122	CORE PLYWOOD WBP 14.5x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
90	WCP00123	CORE PLYWOOD MULTIPLEX MRE 13x1220x2500	WIPA	0	168	2026-04-18 18:15:54.272684	200
91	WCP00124	CORE PLYWOOD MULTIPLEX MRE 10x1220x2500	WIPA	0	168	2026-04-18 18:15:54.272684	200
92	WCP00125	CORE PLYWOOD RECONSTITUTED MRE 10x1220x2500	WIPA	0	168	2026-04-18 18:15:54.272684	200
93	WCP00126	CORE PLYWOOD RECONSTITUTED MRE 13x1220x2500	WIPA	0	168	2026-04-18 18:15:54.272684	200
94	WCP00127	CORE PLYWOOD RECONSTITUTED MRE 14x1220x2500	WIPA	0	168	2026-04-18 18:15:54.272684	200
95	WCP00128	CORE PLYWOOD MRE 8.3x1220x2500	WIPA	0	168	2026-04-18 18:15:54.272684	200
96	WCP00129	CORE PLYWOOD WBP 38x1040x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
97	WCP00130	CORE PLYWOOD MULTIPLEX WBP 16x1220x2400	WIPA	0	168	2026-04-18 18:15:54.272684	200
98	WCP00131	CORE PLYWOOD MRE COMBICORE 16x1232x2452	WIPA	0	168	2026-04-18 18:15:54.272684	200
99	WCP00132	CORE PLYWOOD MRE 7x1220x2280	WIPA	0	168	2026-04-18 18:15:54.272684	200
100	WCP00133	CORE PLYWOOD MRE 13.3x1245x2500	WIPA	0	168	2026-04-18 18:15:54.272684	200
101	WCP00134	CORE PLYWOOD MRE 13x1220x2500	WIPA	0	168	2026-04-18 18:15:54.272684	200
102	WCP00136	CORE PLYWOOD MRE 6.3x1220x2500	WIPA	0	168	2026-04-18 18:15:54.272684	200
103	WCP00137	CORE PLYWOOD MULTIPLEX WBP 16x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
104	WCP00138	CORE PLYWOOD MULTIPLEX MRE 16x1220x2500	WIPA	0	168	2026-04-18 18:15:54.272684	200
105	WCP00139	CORE PLYWOOD WBP 17.1x1245x2464	WIPA	0	168	2026-04-18 18:15:54.272684	200
106	WCP00140	CORE PLYWOOD MULTIPLEX F*4 13.3x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
107	WCP00141	CORE PLYWOOD MRE 28x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
108	WCP00142	CORE PLYWOOD MRE 38x1000x2400	WIPA	0	168	2026-04-18 18:15:54.272684	200
109	WCP00143	CORE PLYWOOD MRE 48x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
110	WCP00144	CORE PLYWOOD MRE 16.3x920x2135	WIPA	0	168	2026-04-18 18:15:54.272684	200
111	WCP00145	CORE PLYWOOD MRE 14.5x1225x2445	WIPA	0	168	2026-04-18 18:15:54.272684	200
112	WCP00146	CORE PLYWOOD WBP 6x1220x2500	WIPA	0	168	2026-04-18 18:15:54.272684	200
113	WCP00147	CORE PLYWOOD WBP 8x1220x2500	WIPA	0	168	2026-04-18 18:15:54.272684	200
114	WCP00148	CORE PLYWOOD WBP 10x1220x2500	WIPA	0	168	2026-04-18 18:15:54.272684	200
115	WCP00149	CORE PLYWOOD WBP 13x1220x2500	WIPA	0	168	2026-04-18 18:15:54.272684	200
116	WCP00150	CORE PLYWOOD WBP 16x1220x2500	WIPA	0	168	2026-04-18 18:15:54.272684	200
117	WCP00151	CORE PLYWOOD WBP 23x1220x2500	WIPA	0	168	2026-04-18 18:15:54.272684	200
118	WCP00152	CORE PLYWOOD WBP 28x1220x2500	WIPA	0	168	2026-04-18 18:15:54.272684	200
119	WCP00153	CORE PLYWOOD MULTIPLEX MRE 16x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
120	WCP00155	CORE PLYWOOD MRE 38x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
121	WCP00156	CORE PLYWOOD MULTIPLEX MRE 18x1220x2500	WIPA	0	168	2026-04-18 18:15:54.272684	200
122	WCP00157	CORE PLYWOOD MULTIPLEX MRE 20x1220x2500	WIPA	0	168	2026-04-18 18:15:54.272684	200
123	WCP00158	CORE PLYWOOD WBP 14.5x1232x3061	WIPA	0	168	2026-04-18 18:15:54.272684	200
124	WCP00159	CORE PLYWOOD MULTIPLEX F*4 7x1220x2440	WIPA	0	168	2026-04-18 18:15:54.272684	200
\.


--
-- TOC entry 5160 (class 0 OID 344398)
-- Dependencies: 248
-- Data for Name: item_assembly_pannel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.item_assembly_pannel (id, assembly_code, description, warehouse, cycle_time, capacity_per_shift, updated_at) FROM stdin;
22	FGD00001	DOORCORE MRE 30x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
23	FGD00006	DOORCORE MRE 40x905x2095	PFIN	200	116	2026-04-18 18:15:48.135553
24	FGD00007	DOORCORE MRE 40x915x2135	PFIN	200	116	2026-04-18 18:15:48.135553
25	FGD00009	DOORCORE MRE 40x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
26	FGD00013	DOORCORE MRE 44x762x1981	PFIN	200	116	2026-04-18 18:15:48.135553
27	FGD00015	DOORCORE MRE 44x820x2150	PFIN	200	116	2026-04-18 18:15:48.135553
28	FGD00016	DOORCORE MRE 44x838x1981	PFIN	200	116	2026-04-18 18:15:48.135553
29	FGD00017	DOORCORE MRE 44x838x2058	PFIN	200	116	2026-04-18 18:15:48.135553
30	FGD00019	DOORCORE MRE 44x915x2135	PFIN	200	116	2026-04-18 18:15:48.135553
31	FGD00020	DOORCORE MRE 44x920x2150	PFIN	200	116	2026-04-18 18:15:48.135553
32	FGD00021	DOORCORE MRE 44x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
33	FGD00109	DOORCORE MRE 35x920x2420	PFIN	200	116	2026-04-18 18:15:48.135553
34	FGD00121	DOORCORE MRE 38x932x2050	PFIN	200	116	2026-04-18 18:15:48.135553
35	FGD00129	DOORCORE MRE 29x810x1810	PFIN	200	116	2026-04-18 18:15:48.135553
36	FGD00343	DOORCORE MRE 44x915x2058	PFIN	200	116	2026-04-18 18:15:48.135553
37	FGD00366	DOORCORE MRE 33x932x2300	PFIN	200	116	2026-04-18 18:15:48.135553
38	FGD00374	DOORCORE MRE 38x932x2300	PFIN	200	116	2026-04-18 18:15:48.135553
39	FGD00375	DOORCORE MRE 27.6x932x2300	PFIN	200	116	2026-04-18 18:15:48.135553
40	FGD00386	DOORCORE MRE 30x932x2300	PFIN	200	116	2026-04-18 18:15:48.135553
41	FGD00399	DOORCORE MRE 35x830x2200	PFIN	200	116	2026-04-18 18:15:48.135553
42	FGD00435	DOORCORE RECONSTITUTED MRE 44x915x2135	PFIN	200	116	2026-04-18 18:15:48.135553
43	FGD00441	DOORCORE RECONSTITUTED MRE 44x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
44	FGD00496	DOORCORE MRE 33x920x2150	PFIN	200	116	2026-04-18 18:15:48.135553
45	FGD00505	DOORCORE MRE 30x1100x2400	PFIN	200	116	2026-04-18 18:15:48.135553
46	FGD00523	DOORCORE MRE 44x1232x2451	PFIN	200	116	2026-04-18 18:15:48.135553
47	FGD00525	DOORCORE FJLC MRE 44x1220x3048	PFIN	200	116	2026-04-18 18:15:48.135553
48	FGD00529	DOORCORE FJLC MRE 44x1232x3061	PFIN	200	116	2026-04-18 18:15:48.135553
49	FGD00530	DOORCORE MRE 33x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
50	FGD00533	DOORCORE MRE 3 LAYER 40x915x2135	PFIN	200	116	2026-04-18 18:15:48.135553
51	FGD00536	DOORCORE 3 LAYER MRE 44x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
52	FGD00538	DOORCORE RECONSTITUTED MRE 33x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
53	FGD00544	DOORCORE MRE 32x1232x2451	PFIN	200	116	2026-04-18 18:15:48.135553
54	FGD00550	DOORCORE MRE 25x932x2300	PFIN	200	116	2026-04-18 18:15:48.135553
55	FGD00552	DOORCORE RECONSTITUTED MRE 54x915x2135	PFIN	200	116	2026-04-18 18:15:48.135553
56	FGD00554	DOORCORE RECONSTITUTED MRE 54x838x2040	PFIN	200	116	2026-04-18 18:15:48.135553
57	FGD00560	DOORCORE MDF MRE 32x1232x2451	PFIN	200	116	2026-04-18 18:15:48.135553
58	FGD00562	DOORCORE MDF MRE 38x1232x2451	PFIN	200	116	2026-04-18 18:15:48.135553
59	FGD00564	DOORCORE MDF MRE 44x1232x2451	PFIN	200	116	2026-04-18 18:15:48.135553
60	FGD00566	DOORCORE MRE 39.8x830x2250	PFIN	200	116	2026-04-18 18:15:48.135553
61	FGK00003	BLOCKBOARD MRE 18x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
62	FGK00285	BLOCKBOARD FJLC MRE 18x1220x2500	PFIN	200	116	2026-04-18 18:15:48.135553
63	FGK00286	BLOCKBOARD FJLC MRE 39.2x1245x2200	PFIN	200	116	2026-04-18 18:15:48.135553
64	FGK00287	BLOCKBOARD FJLC MRE 18x1245x2500	PFIN	200	116	2026-04-18 18:15:48.135553
65	FGL00001	LVL F4 12x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
66	FGL00200	LVL MRE 34x860x2267	PFIN	200	116	2026-04-18 18:15:48.135553
67	FGL00201	LVL MRE 34x860x1967	PFIN	200	116	2026-04-18 18:15:48.135553
68	FGL00295	LVL MRE 44x950x2440	PFIN	200	116	2026-04-18 18:15:48.135553
69	FGP00006	PLYWOOD MRE 5x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
70	FGP00011	PLYWOOD MRE 6x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
71	FGP00014	PLYWOOD MRE 8x1220x2500	PFIN	200	116	2026-04-18 18:15:48.135553
72	FGP00021	PLYWOOD MRE 9x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
73	FGP00024	PLYWOOD MRE 10x1220x2500	PFIN	200	116	2026-04-18 18:15:48.135553
74	FGP00027	PLYWOOD MRE 12x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
75	FGP00028	PLYWOOD MRE 12x1220x2500	PFIN	200	116	2026-04-18 18:15:48.135553
76	FGP00032	PLYWOOD MRE 15x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
77	FGP00033	PLYWOOD MRE 15x1220x2500	PFIN	200	116	2026-04-18 18:15:48.135553
78	FGP00034	PLYWOOD MRE 18x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
79	FGP00035	PLYWOOD MRE 18x1220x2500	PFIN	200	116	2026-04-18 18:15:48.135553
80	FGP00089	PLYWOOD MRE 21x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
81	FGP00162	PLYWOOD MRE 20x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
82	FGP00557	PLYWOOD MRE 9x1220x2280	PFIN	200	116	2026-04-18 18:15:48.135553
83	FGP00615	PLYWOOD MRE 15x1245x2500	PFIN	200	116	2026-04-18 18:15:48.135553
84	FGP00685	PLYWOOD WBP 12x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
85	FGP00688	PLYWOOD MDF MRE 15x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
86	FGP00690	PLYWOOD WBP 15x1220x2500	PFIN	200	116	2026-04-18 18:15:48.135553
87	FGP00691	PLYWOOD WBP 18x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
88	FGP00900	PLYWOOD MDF WBP 18x1251x2470	PFIN	200	116	2026-04-18 18:15:48.135553
89	FGP00901	PLYWOOD WBP MULTIPLEX COMBICORE 12x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
90	FGP00904	PLYWOOD MRE 12x1220x2280	PFIN	200	116	2026-04-18 18:15:48.135553
91	FGP00905	PLYWOOD MRE COMBICORE JABON 18.5x1232x2452	PFIN	200	116	2026-04-18 18:15:48.135553
92	FGP00906	PLYWOOD MRE 23.5x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
93	FGP00907	PLYWOOD MRE 16.5x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
94	FGP00910	PLYWOOD WBP MULTIPLEX COMBICORE 18x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
95	FGP00911	PLYWOOD MDF WBP 18x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
96	FGP00912	PLYWOOD MULTIPLEX MRE 15x1220x2500	PFIN	200	116	2026-04-18 18:15:48.135553
97	FGP00913	PLYWOOD MULTIPLEX MRE 12x1220x2500	PFIN	200	116	2026-04-18 18:15:48.135553
98	FGP00914	PLYWOOD RECONSTITUTED MRE 12x1220x2500	PFIN	200	116	2026-04-18 18:15:48.135553
99	FGP00915	PLYWOOD RECONSTITUTED MRE 15x1220x2500	PFIN	200	116	2026-04-18 18:15:48.135553
100	FGP00916	PLYWOOD RECONSTITUTED MRE 16x1220x2500	PFIN	200	116	2026-04-18 18:15:48.135553
101	FGP00918	PLYWOOD MULTIPLEX MRE 18x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
102	FGP00920	PLYWOOD WBP 40x1040x2440	PFIN	200	116	2026-04-18 18:15:48.135553
103	FGP00921	PLYWOOD MULTIPLEX WBP 18x1220x2400	PFIN	200	116	2026-04-18 18:15:48.135553
104	FGP00922	PLYWOOD MRE COMBICORE MDF 18.5x1232x2452	PFIN	200	116	2026-04-18 18:15:48.135553
105	FGP00935	PLYWOOD WBP COMBICORE MULTIPLEX 18.5x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
106	FGP00950	PLYWOOD MULTIPLEX WBP 18x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
107	FGP00951	PLYWOOD MULTIPLEX MRE 18x1220x2500	PFIN	200	116	2026-04-18 18:15:48.135553
108	FGP00954	PLYWOOD MULTIPLEX MRE 9x1220x2500	PFIN	200	116	2026-04-18 18:15:48.135553
109	FGP00966	PLYWOOD WBP 19.1x1245x2464	PFIN	200	116	2026-04-18 18:15:48.135553
110	FGP00970	PLYWOOD MULTIPLEX WBP 12x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
111	FGP00972	PLYWOOD MULTIPLEX F*4 15x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
112	FGP00978	PLYWOOD MRE 30x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
113	FGP00980	PLYWOOD MRE 40x1000x2400	PFIN	200	116	2026-04-18 18:15:48.135553
114	FGP00982	PLYWOOD MRE 50x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
115	FGP00994	PLYWOOD MRE 18x920x2135	PFIN	200	116	2026-04-18 18:15:48.135553
116	FGP00997	PLYWOOD MRE 16.5x1225x2445	PFIN	200	116	2026-04-18 18:15:48.135553
117	FGP01001	PLYWOOD WBP COMBICORE MDF 18x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
118	FGP01007	PLYWOOD WBP 8x1220x2500	PFIN	200	116	2026-04-18 18:15:48.135553
119	FGP01009	PLYWOOD WBP 10x1220x2500	PFIN	200	116	2026-04-18 18:15:48.135553
120	FGP01011	PLYWOOD WBP 12x1220x2500	PFIN	200	116	2026-04-18 18:15:48.135553
121	FGP01014	PLYWOOD WBP 18x1220x2500	PFIN	200	116	2026-04-18 18:15:48.135553
122	FGP01016	PLYWOOD WBP 25x1220x2500	PFIN	200	116	2026-04-18 18:15:48.135553
123	FGP01017	PLYWOOD WBP 30x1220x2500	PFIN	200	116	2026-04-18 18:15:48.135553
124	FGP01027	PLYWOOD MRE 40x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
125	FGP01035	PLYWOOD MULTIPLEX MRE 20x1220x2500	PFIN	200	116	2026-04-18 18:15:48.135553
126	FGP01037	PLYWOOD MULTIPLEX MRE 22x1220x2500	PFIN	200	116	2026-04-18 18:15:48.135553
127	FGP01039	PLYWOOD MDF WBP 17.5x1232x3061	PFIN	200	116	2026-04-18 18:15:48.135553
128	FGP01047	PLYWOOD MULTIPLEX F*4 9x1220x2440	PFIN	200	116	2026-04-18 18:15:48.135553
\.


--
-- TOC entry 5164 (class 0 OID 344477)
-- Dependencies: 252
-- Data for Name: item_finishing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.item_finishing (id, finishing_code, description, warehouse, item_code, cycle_time, capacity_per_shift) FROM stdin;
28	FGD00130	FG DOORCORE MRE 44x920x2150	FGOD	\N	200	90
29	FGD00131	FG DOORCORE MRE 29x810x1810	FGOD	\N	200	90
30	FGD00132	FG DOORCORE MRE 40x1220x2440	FGOD	\N	200	90
31	FGD00134	FG DOORCORE MRE 40x905x2095	FGOD	\N	200	90
32	FGD00135	FG DOORCORE MRE 40x915x2135	FGOD	\N	200	90
33	FGD00136	FG DOORCORE MRE 44x1220x2440	FGOD	\N	200	90
34	FGD00147	FG DOORCORE MRE 38x932x2050	FGOD	\N	200	90
35	FGD00152	FG DOORCORE MRE 44x915x2135	FGOD	\N	200	90
36	FGD00158	FG DOORCORE MRE 30x1220x2440	FGOD	\N	200	90
37	FGD00192	FG DOORCORE MRE 44x820x2150	FGOD	\N	200	90
38	FGD00207	FG DOORCORE MRE 44x762x1981	FGOD	\N	200	90
39	FGD00209	FG DOORCORE MRE 44x838x1981	FGOD	\N	200	90
40	FGD00249	FG DOORCORE MRE 44x838x2058	FGOD	\N	200	90
41	FGD00347	FG DOORCORE MRE 44x915x2058	FGOD	\N	200	90
42	FGD00368	FG DOORCORE MRE 33x932x2300	FGOD	\N	200	90
43	FGD00376	FG DOORCORE MRE 27.6x932x2300	FGOD	\N	200	90
44	FGD00377	FG DOORCORE MRE 38x932x2300	FGOD	\N	200	90
45	FGD00391	FG DOORCORE MRE 30x932x2300	FGOD	\N	200	90
46	FGD00407	FG DOORCORE MRE 35x830x2200	FGOD	\N	200	90
47	FGD00436	FG DOORCORE RECONSTITUTED MRE 44x915x2135	FGOD	\N	200	90
48	FGD00450	FG DOORCORE RECONSTITUTED MRE 44x1220x2440	FGOD	\N	200	90
49	FGD00497	FG DOORCORE MRE 33x920x2150	FGOD	\N	200	90
50	FGD00506	FG DOORCORE MRE 30x1100x2400	FGOD	\N	200	90
51	FGD00510	FG DOORCORE MRE 35x920x2420	FGOD	\N	200	90
52	FGD00519	FG DOORCORE MRE 33x1220x2440	FGOD	\N	200	90
53	FGD00522	FG DOORCORE MRE 44x1232x2451	FGOD	\N	200	90
54	FGD00524	FG DOORCORE FJLC MRE 44x1220x3048	FGOD	\N	200	90
55	FGD00528	FG DOORCORE FJLC MRE 44x1232x3061	FGOD	\N	200	90
56	FGD00532	FG DOORCORE MRE 3 LAYER 40x915x2135	FGOD	\N	200	90
57	FGD00535	FG DOORCORE 3 LAYER MRE 44x1220x2440	FGOD	\N	200	90
58	FGD00537	FG DOORCORE RECONSTITUTED MRE 33x1220x2440	FGOD	\N	200	90
59	FGD00543	FG DOORCORE MRE 32x1232x2451	FGOD	\N	200	90
60	FGD00549	FG DOORCORE MRE 25x932x2300	FGOD	\N	200	90
61	FGD00551	FG DOORCORE RECONSTITUTED MRE 54x915x2135	FGOD	\N	200	90
62	FGD00553	FG DOORCORE RECONSTITUTED MRE 54x838x2040	FGOD	\N	200	90
63	FGD00559	FG DOORCORE MDF MRE 32x1232x2451	FGOD	\N	200	90
64	FGD00561	FG DOORCORE MDF MRE 38x1232x2451	FGOD	\N	200	90
65	FGD00563	FG DOORCORE MDF MRE 44x1232x2451	FGOD	\N	200	90
66	FGD00565	FG DOORCORE MRE 39.8x830x2250	FGOD	\N	200	90
67	FGK00103	FG BLOCKBOARD MRE 18x1220x2440	FGOD	\N	200	90
68	FGK00281	FG BLOCKBOARD FJLC MRE 18x1245x2500	FGOD	\N	200	90
69	FGK00282	FG BLOCKBOARD FJLC MRE 39.2x1245x2200	FGOD	\N	200	90
70	FGK00283	FG BLOCKBOARD FJLC MRE 18x1220x2500	FGOD	\N	200	90
71	FGL00202	FG LVL MRE 34x860x1967	FGOD	\N	200	90
72	FGL00203	FG LVL MRE 34x860x2267	FGOD	\N	200	90
73	FGL00216	FG LVL F4 12x1220x2440	FGOD	\N	200	90
74	FGL00294	FG LVL MRE 44x950x2440	FGOD	\N	200	90
75	FGP00212	FG PLYWOOD MRE 12x1220x2440	FGOD	\N	200	90
76	FGP00213	FG PLYWOOD MRE 10x1220x2500	FGOD	\N	200	90
77	FGP00214	FG PLYWOOD MRE 12x1220x2500	FGOD	\N	200	90
78	FGP00217	FG PLYWOOD MRE 15x1220x2500	FGOD	\N	200	90
79	FGP00218	FG PLYWOOD MRE 18x1220x2440	FGOD	\N	200	90
80	FGP00219	FG PLYWOOD MRE 18x1220x2500	FGOD	\N	200	90
81	FGP00224	FG PLYWOOD WBP 8x1220x2500	FGOD	\N	200	90
82	FGP00225	FG PLYWOOD MRE 6x1220x2440	FGOD	\N	200	90
83	FGP00276	FG PLYWOOD MRE 15x1220x2440	FGOD	\N	200	90
84	FGP00330	FG PLYWOOD MRE 9x1220x2440	FGOD	\N	200	90
85	FGP00402	FG PLYWOOD MRE 21x1220x2440	FGOD	\N	200	90
86	FGP00564	FG PLYWOOD MRE 9x1220x2280	FGOD	\N	200	90
87	FGP00631	FG PLYWOOD MRE 15x1245x2500	FGOD	\N	200	90
88	FGP00682	FG PLYWOOD WBP 12x1220x2440	FGOD	\N	200	90
89	FGP00707	FG PLYWOOD WBP 18x1220x2440	FGOD	\N	200	90
90	FGP00719	FG PLYWOOD MRE 5x1220x2440	FGOD	\N	200	90
91	FGP00754	FG PLYWOOD MRE 8x1220x2500	FGOD	\N	200	90
92	FGP00808	FG PLYWOOD MDF WBP 18x1220x2440	FGOD	\N	200	90
93	FGP00859	FG PLYWOOD MRE COMBICORE JABON 18.5x1232x2452	FGOD	\N	200	90
94	FGP00861	FG PLYWOOD MULTIPLEX WBP 18x1220x2400	FGOD	\N	200	90
95	FGP00863	FG PLYWOOD MRE COMBICORE MDF 18.5x1232x2452	FGOD	\N	200	90
96	FGP00872	FG PLYWOOD MULTIPLEX MRE 12x1220x2500	FGOD	\N	200	90
97	FGP00873	FG PLYWOOD MULTIPLEX MRE 15x1220x2500	FGOD	\N	200	90
98	FGP00877	FG PLYWOOD MRE 16.5x1220x2440	FGOD	\N	200	90
99	FGP00878	FG PLYWOOD MRE 23.5x1220x2440	FGOD	\N	200	90
100	FGP00879	FG PLYWOOD MRE 12x1220x2280	FGOD	\N	200	90
101	FGP00888	FG PLYWOOD RECONSTITUTED MRE 12x1220x2500	FGOD	\N	200	90
102	FGP00890	FG PLYWOOD RECONSTITUTED MRE 15x1220x2500	FGOD	\N	200	90
103	FGP00892	FG PLYWOOD RECONSTITUTED MRE 16x1220x2500	FGOD	\N	200	90
104	FGP00893	FG PLYWOOD MDF MRE 15x1220x2440	FGOD	\N	200	90
105	FGP00897	FG PLYWOOD MDF WBP 18x1251x2470	FGOD	\N	200	90
106	FGP00898	FG PLYWOOD WBP MULTIPLEX COMBICORE 12x1220x2440	FGOD	\N	200	90
107	FGP00899	FG PLYWOOD WBP MULTIPLEX COMBICORE 18x1220x2440	FGOD	\N	200	90
108	FGP00919	FG PLYWOOD WBP 40x1040x2440	FGOD	\N	200	90
109	FGP00934	FG PLYWOOD WBP COMBICORE MULTIPLEX 18.5x1220x2440	FGOD	\N	200	90
110	FGP00949	FG PLYWOOD MULTIPLEX WBP 18x1220x2440	FGOD	\N	200	90
111	FGP00952	FG PLYWOOD MULTIPLEX MRE 18x1220x2500	FGOD	\N	200	90
112	FGP00953	FG PLYWOOD MULTIPLEX MRE 9x1220x2500	FGOD	\N	200	90
113	FGP00956	FG PLYWOOD MULTIPLEX WBP 18x1220x2440	FGOD	\N	200	90
114	FGP00965	FG PLYWOOD WBP 19.1x1245x2464	FGOD	\N	200	90
115	FGP00969	FG PLYWOOD MULTIPLEX WBP 12x1220x2440	FGOD	\N	200	90
116	FGP00971	FG PLYWOOD MULTIPLEX F*4 15x1220x2440	FGOD	\N	200	90
117	FGP00977	FG PLYWOOD MRE 30x1220x2440	FGOD	\N	200	90
118	FGP00979	FG PLYWOOD MRE 40x1000x2400	FGOD	\N	200	90
119	FGP00981	FG PLYWOOD MRE 50x1220x2440	FGOD	\N	200	90
120	FGP00993	FG PLYWOOD MRE 18x920x2135	FGOD	\N	200	90
121	FGP00995	FG PLYWOOD MRE 16.5x1225x2445	FGOD	\N	200	90
122	FGP01000	FG PLYWOOD WBP COMBICORE MDF 18x1220x2440	FGOD	\N	200	90
123	FGP01008	FG PLYWOOD WBP 10x1220x2500	FGOD	\N	200	90
124	FGP01010	FG PLYWOOD WBP 12x1220x2500	FGOD	\N	200	90
125	FGP01012	FG PLYWOOD WBP 15x1220x2500	FGOD	\N	200	90
126	FGP01013	FG PLYWOOD WBP 18x1220x2500	FGOD	\N	200	90
127	FGP01015	FG PLYWOOD WBP 30x1220x2500	FGOD	\N	200	90
128	FGP01018	FG PLYWOOD WBP 25x1220x2500	FGOD	\N	200	90
129	FGP01024	FG PLYWOOD MULTIPLEX MRE 18x1220x2440	FGOD	\N	200	90
130	FGP01026	FG PLYWOOD MRE 40x1220x2440	FGOD	\N	200	90
131	FGP01029	FG PLYWOOD MRE 20x1220x2440	FGOD	\N	200	90
132	FGP01034	FG PLYWOOD MULTIPLEX MRE 20x1220x2500	FGOD	\N	200	90
133	FGP01036	FG PLYWOOD MULTIPLEX MRE 22x1220x2500	FGOD	\N	200	90
134	FGP01038	FG PLYWOOD MDF WBP 17.5x1232x3061	FGOD	\N	200	90
135	FGP01046	FG PLYWOOD MULTIPLEX F*4 9x1220x2440	FGOD	\N	200	90
\.


--
-- TOC entry 5166 (class 0 OID 344490)
-- Dependencies: 254
-- Data for Name: item_routings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.item_routings (id, item_code, finishing_code, assembly_code_pannel, assembly_code_core) FROM stdin;
12	FGD00024	FGD00158	FGD00001	WCD00001
13	FGD00029	FGD00134	FGD00006	WCD00006
14	FGD00030	FGD00135	FGD00007	WCD00007
15	FGD00032	FGD00132	FGD00009	WCD00047
16	FGD00036	FGD00207	FGD00013	WCD00008
17	FGD00038	FGD00192	FGD00015	WCD00016
18	FGD00039	FGD00209	FGD00016	WCD00050
19	FGD00040	FGD00249	FGD00017	WCD00049
20	FGD00042	FGD00152	FGD00019	WCD00010
21	FGD00043	FGD00130	FGD00020	WCD00015
22	FGD00044	FGD00136	FGD00021	WCD00011
23	FGD00045	FGD00522	FGD00523	WCD00110
24	FGD00106	FGD00510	FGD00109	WCD00040
25	FGD00122	FGD00147	FGD00121	WCD00053
26	FGD00126	FGD00131	FGD00129	WCD00058
27	FGD00215	FGD00497	FGD00496	WCD00108
28	FGD00329	FGD00347	FGD00343	WCD00079
29	FGD00363	FGD00368	FGD00366	WCD00083
30	FGD00367	FGD00377	FGD00374	WCD00084
31	FGD00372	FGD00376	FGD00375	WCD00117
32	FGD00384	FGD00391	FGD00386	WCD00086
33	FGD00388	FGD00407	FGD00399	WCD00089
34	FGD00439	FGD00436	FGD00435	WCD00127
35	FGD00440	FGD00450	FGD00441	WCD00115
36	FGD00484	FGD00506	FGD00505	WCD00109
37	FGD00518	FGD00519	FGD00530	WCD00005
38	FGD00521	FGD00524	FGD00525	WCD00111
39	FGD00526	FGD00537	FGD00538	WCD00121
40	FGD00527	FGD00528	FGD00529	WCD00114
41	FGD00531	FGD00532	FGD00533	WCD00118
42	FGD00534	FGD00535	FGD00536	WCD00119
43	FGD00542	FGD00543	FGD00544	WCD00122
44	FGD00546	FGD00549	FGD00550	WCD00124
45	FGD00547	FGD00551	FGD00552	WCD00125
46	FGD00548	FGD00553	FGD00554	WCD00126
47	FGD00555	FGD00559	FGD00560	WCD00128
48	FGD00556	FGD00561	FGD00562	WCD00129
49	FGD00557	FGD00563	FGD00564	WCD00130
50	FGD00558	FGD00565	FGD00566	WCD00131
51	FGK00014	FGK00103	FGK00003	WCB00002
52	FGK00279	FGK00281	FGK00287	WCB00022
53	FGK00280	FGK00282	FGK00286	WCB00021
54	FGK00284	FGK00283	FGK00285	WCB00020
55	FGL00016	FGL00216	FGL00001	WCL00009
56	FGL00195	FGL00202	FGL00201	WCL00029
57	FGL00196	FGL00203	FGL00200	WCL00030
58	FGL00293	FGL00294	FGL00295	WCL00036
59	FGP00039	FGP00682	FGP00685	WCP00100
60	FGP00048	FGP00719	FGP00006	WCP00059
61	FGP00053	FGP00225	FGP00011	WCP00082
62	FGP00056	FGP00754	FGP00014	WCP00136
63	FGP00063	FGP00330	FGP00021	WCP00077
64	FGP00066	FGP00213	FGP00024	WCP00128
65	FGP00069	FGP00212	FGP00027	WCP00076
66	FGP00070	FGP00214	FGP00028	WCP00021
67	FGP00074	FGP00276	FGP00032	WCP00078
68	FGP00075	FGP00217	FGP00033	WCP00134
69	FGP00076	FGP00218	FGP00034	WCP00079
70	FGP00077	FGP00219	FGP00035	WCP00079
71	FGP00098	FGP00402	FGP00089	WCP00023
72	FGP00144	FGP00808	FGP00911	WCP00122
73	FGP00163	FGP01029	FGP00162	WCP00012
74	FGP00550	FGP00564	FGP00557	WCP00132
75	FGP00607	FGP00631	FGP00615	WCP00133
76	FGP00706	FGP00893	FGP00688	WCP00005
77	FGP00745	FGP00682	FGP00685	WCP00100
78	FGP00746	FGP00707	FGP00691	WCP00102
79	FGP00796	FGP00218	FGP00034	WCP00079
80	FGP00858	FGP00859	FGP00905	WCP00117
81	FGP00860	FGP00861	FGP00921	WCP00130
82	FGP00862	FGP00863	FGP00922	WCP00131
83	FGP00870	FGP00872	FGP00913	WCP00124
84	FGP00871	FGP00873	FGP00912	WCP00123
85	FGP00874	FGP00877	FGP00907	WCP00120
86	FGP00875	FGP00878	FGP00906	WCP00009
87	FGP00876	FGP00879	FGP00904	WCP00115
88	FGP00887	FGP00888	FGP00914	WCP00125
89	FGP00889	FGP00890	FGP00915	WCP00126
90	FGP00891	FGP00892	FGP00916	WCP00127
91	FGP00894	FGP00897	FGP00900	WCP00114
92	FGP00895	FGP00898	FGP00901	WCP00113
93	FGP00896	FGP00899	FGP00910	WCP00121
94	FGP00917	FGP00919	FGP00920	WCP00129
95	FGP00933	FGP00934	FGP00935	WCP00121
96	FGP00945	FGP00953	FGP00954	WCP00026
97	FGP00946	FGP00952	FGP00951	WCP00138
98	FGP00947	FGP00949	FGP00950	WCP00137
99	FGP00955	FGP00993	FGP00994	WCP00144
100	FGP00957	FGP00956	FGP00950	WCP00137
101	FGP00961	FGP01046	FGP01047	WCP00159
102	FGP00962	FGP00969	FGP00970	WCP00100
103	FGP00963	FGP00971	FGP00972	WCP00140
104	FGP00973	FGP00995	FGP00997	WCP00145
105	FGP00974	FGP00979	FGP00980	WCP00142
106	FGP00975	FGP00977	FGP00978	WCP00141
107	FGP00976	FGP00981	FGP00982	WCP00143
108	FGP00986	FGP00224	FGP01007	WCP00146
109	FGP00987	FGP01008	FGP01009	WCP00147
110	FGP00988	FGP01010	FGP01011	WCP00148
111	FGP00989	FGP01012	FGP00690	WCP00149
112	FGP00990	FGP01013	FGP01014	WCP00150
113	FGP00991	FGP01018	FGP01016	WCP00151
114	FGP00992	FGP01015	FGP01017	WCP00152
115	FGP00999	FGP01000	FGP01001	WCP00034
116	FGP01019	FGP00965	FGP00966	WCP00139
117	FGP01020	FGP01034	FGP01035	WCP00156
118	FGP01021	FGP01036	FGP01037	WCP00157
119	FGP01023	FGP01024	FGP00918	WCP00153
120	FGP01025	FGP01026	FGP01027	WCP00155
121	FGP01031	FGP01038	FGP01039	WCP00158
122	FGP01048	FGP00965	FGP00966	WCP00139
\.


--
-- TOC entry 5142 (class 0 OID 278553)
-- Dependencies: 230
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.items (id, item_code, description, uom, warehouse, cycle_time, capacity_per_shift) FROM stdin;
98	FGD00024	ALBASIA FALCATA DOORCORE MRE 30x1220x2440	M3	GPAK	200	95
99	FGD00029	ALBASIA FALCATA DOORCORE MRE 40x905x2095	M3	GPAK	200	95
100	FGD00030	ALBASIA FALCATA DOORCORE MRE 40x915x2135	M3	GPAK	200	95
101	FGD00032	ALBASIA FALCATA DOORCORE MRE 40x1220x2440	M3	GPAK	200	95
102	FGD00036	ALBASIA FALCATA DOORCORE MRE 44x762x1981	M3	GPAK	200	95
103	FGD00038	ALBASIA FALCATA DOORCORE MRE 44x820x2150	M3	GPAK	200	95
104	FGD00039	ALBASIA FALCATA DOORCORE MRE 44x838x1981	M3	GPAK	200	95
105	FGD00040	ALBASIA FALCATA DOORCORE MRE 44x838x2058	M3	GPAK	200	95
106	FGD00042	ALBASIA FALCATA DOORCORE MRE 44x915x2135	M3	GPAK	200	95
107	FGD00043	ALBASIA FALCATA DOORCORE MRE 44x920x2150	M3	GPAK	200	95
108	FGD00044	ALBASIA FALCATA DOORCORE MRE 44x1220x2440	M3	GPAK	200	95
109	FGD00045	ALBASIA FALCATA DOORCORE MRE 44x1232x2451	M3	GPAK	200	95
110	FGD00106	ALBASIA FALCATA DOORCORE MRE 35x920x2420	M3	GPAK	200	95
111	FGD00122	ALBASIA FALCATA DOORCORE MRE 38x932x2050	M3	GPAK	200	95
112	FGD00126	ALBASIA FALCATA DOORCORE MRE 29x810x1810	M3	GPAK	200	95
113	FGD00215	ALBASIA FALCATA DOORCORE MRE 33x920x2150	M3	GPAK	200	95
114	FGD00329	ALBASIA FALCATA DOORCORE MRE 44x915x2058	M3	GPAK	200	95
115	FGD00363	ALBASIA FALCATA DOORCORE MRE 33x932x2300	M3	GPAK	200	95
116	FGD00367	ALBASIA FALCATA DOORCORE MRE 38x932x2300	M3	GPAK	200	95
117	FGD00372	ALBASIA FALCATA DOORCORE MRE 27.6x932x2300	M3	GPAK	200	95
118	FGD00384	ALBASIA FALCATA DOORCORE MRE 30x932x2300	M3	GPAK	200	95
119	FGD00388	ALBASIA FALCATA DOORCORE MRE 35x830x2200	M3	GPAK	200	95
120	FGD00439	ALBASIA FALCATA DOORCORE RECONSTITUTED MRE 44x915x2135	M3	GPAK	200	95
121	FGD00440	ALBASIA FALCATA DOORCORE RECONSTITUTED MRE 44x1220x2440	M3	GPAK	200	95
122	FGD00484	ALBASIA FALCATA DOORCORE MRE 30x1100x2400	M3	GPAK	200	95
123	FGD00518	ALBASIA FALCATA DOORCORE MRE 33x1220x2440	M3	GPAK	200	95
124	FGD00521	ALBASIA FALCATA DOORCORE FJLC MRE 44x1220x3048	M3	GPAK	200	95
125	FGD00526	ALBASIA FALCATA DOORCORE RECONSTITUTED MRE 33x1220x2440	M3	GPAK	200	95
126	FGD00527	ALBASIA FALCATA DOORCORE FJLC MRE 44x1232x3061	M3	GPAK	200	95
127	FGD00531	ALBASIA FALCATA DOORCORE MRE 3 LAYER 40x915x2135	M3	GPAK	200	95
128	FGD00534	ALBASIA FALCATA DOORCORE 3 LAYER MRE 44x1220x2440	M3	GPAK	200	95
129	FGD00542	ALBASIA FALCATA DOORCORE MRE 32x1232x2451	M3	GPAK	200	95
130	FGD00546	ALBASIA FALCATA DOORCORE MRE 25x932x2300	M3	GPAK	200	95
131	FGD00547	ALBASIA FALCATA DOORCORE RECONSTITUTED MRE 54x915x2135	M3	GPAK	200	95
132	FGD00548	ALBASIA FALCATA DOORCORE RECONSTITUTED MRE 54x838x2040	M3	GPAK	200	95
133	FGD00555	ALBASIA FALCATA DOORCORE MDF MRE 32x1232x2451	M3	GPAK	200	95
134	FGD00556	ALBASIA FALCATA DOORCORE MDF MRE 38x1232x2451	M3	GPAK	200	95
135	FGD00557	ALBASIA FALCATA DOORCORE MDF MRE 44x1232x2451	M3	GPAK	200	95
136	FGD00558	ALBASIA FALCATA DOORCORE MRE 39.8x830x2250	M3	GPAK	200	95
137	FGK00014	ALBASIA FALCATA BLOCKBOARD MRE 18x1220x2440	M3	GPAK	200	95
138	FGK00279	ALBASIA FALCATA BLOCKBOARD FJLC MRE 18x1245x2500	M3	GPAK	200	95
139	FGK00280	ALBASIA FALCATA BLOCKBOARD FJLC MRE 39.2x1245x2200	M3	GPAK	200	95
140	FGK00284	ALBASIA FALCATA BLOCKBOARD FJLC MRE 18x1220x2500	M3	GPAK	200	95
141	FGL00016	ALBASIA FALCATA LVL WBP 12x1220x2440	M3	GPAK	200	95
142	FGL00195	ALBASIA FALCATA LVL MRE 34x860x1967	M3	GPAK	200	95
143	FGL00196	ALBASIA FALCATA LVL MRE 34x860x2267	M3	GPAK	200	95
144	FGL00293	ALBASIA FALCATA LVL MRE 44x950x2440	M3	GPAK	200	95
145	FGP00039	FG PLYWOOD WBP COATING 12x1220x2440	M3	GPAK	200	95
146	FGP00048	ALBASIA FALCATA PLYWOOD MRE 5x1220x2440	M3	GPAK	200	95
147	FGP00053	ALBASIA FALCATA PLYWOOD MRE 6x1220x2440	M3	GPAK	200	95
148	FGP00056	ALBASIA FALCATA PLYWOOD MRE 8x1220x2500	M3	GPAK	200	95
149	FGP00063	ALBASIA FALCATA PLYWOOD MRE 9x1220x2440	M3	GPAK	200	95
150	FGP00066	ALBASIA FALCATA PLYWOOD MRE 10x1220x2500	M3	GPAK	200	95
151	FGP00069	ALBASIA FALCATA PLYWOOD MRE 12x1220x2440	M3	GPAK	200	95
152	FGP00070	ALBASIA FALCATA PLYWOOD MRE 12x1220x2500	M3	GPAK	200	95
153	FGP00074	ALBASIA FALCATA PLYWOOD MRE 15x1220x2440	M3	GPAK	200	95
154	FGP00075	ALBASIA FALCATA PLYWOOD MRE 15x1220x2500	M3	GPAK	200	95
155	FGP00076	ALBASIA FALCATA PLYWOOD MRE 18x1220x2440	M3	GPAK	200	95
156	FGP00077	ALBASIA FALCATA PLYWOOD MRE 18x1220x2500	M3	GPAK	200	95
157	FGP00098	ALBASIA FALCATA PLYWOOD MRE 21x1220x2440	M3	GPAK	200	95
158	FGP00144	ALBASIA FALCATA PLYWOOD MDF WBP 18x1220x2440	M3	GPAK	200	95
159	FGP00163	ALBASIA FALCATA PLYWOOD MRE 20x1220x2440	M3	GPAK	200	95
160	FGP00550	ALBASIA FALCATA PLYWOOD MRE 9x1220x2280	M3	GPAK	200	95
161	FGP00607	ALBASIA FALCATA PLYWOOD MRE 15x1245x2500	M3	GPAK	200	95
162	FGP00706	ALBASIA FALCATA PLYWOOD MDF MRE 15x1220x2440	M3	GPAK	200	95
163	FGP00745	ALBASIA FALCATA PLYWOOD WBP 12x1220x2440	M3	GPAK	200	95
164	FGP00746	ALBASIA FALCATA PLYWOOD WBP 18x1220x2440	M3	GPAK	200	95
165	FGP00796	ALBASIA FALCATA PLYWOOD MDF MRE 18x1220x2440	M3	GPAK	200	95
166	FGP00858	ALBASIA FALCATA PLYWOOD MRE COMBICORE JABON 18.5x1232x2452	M3	GPAK	200	95
167	FGP00860	ALBASIA FALCATA PLYWOOD MULTIPLEX WBP 18x1220x2400	M3	GPAK	200	95
168	FGP00862	ALBASIA FALCATA PLYWOOD MRE COMBICORE MDF 18.5x1232x2452	M3	GPAK	200	95
169	FGP00870	ALBASIA FALCATA PLYWOOD MULTIPLEX MRE 12x1220x2500	M3	GPAK	200	95
170	FGP00871	ALBASIA FALCATA PLYWOOD MULTIPLEX MRE 15x1220x2500	M3	GPAK	200	95
171	FGP00874	ALBASIA FALCATA PLYWOOD MRE 16.5x1220x2440	M3	GPAK	200	95
172	FGP00875	ALBASIA FALCATA PLYWOOD MRE 23.5x1220x2440	M3	GPAK	200	95
173	FGP00876	ALBASIA FALCATA PLYWOOD MRE 12x1220x2280	M3	GPAK	200	95
174	FGP00887	ALBASIA FALCATA PLYWOOD RECONSTITUTED MRE 12x1220x2500	M3	GPAK	200	95
175	FGP00889	ALBASIA FALCATA PLYWOOD RECONSTITUTED MRE 15x1220x2500	M3	GPAK	200	95
176	FGP00891	ALBASIA FALCATA PLYWOOD RECONSTITUTED MRE 16x1220x2500	M3	GPAK	200	95
177	FGP00894	ALBASIA FALCATA PLYWOOD MDF WBP 18x1251x2470	M3	GPAK	200	95
178	FGP00895	ALBASIA FALCATA PLYWOOD MULTIPLEX COMBICORE WBP 12x1220x2440	M3	GPAK	200	95
179	FGP00896	ALBASIA FALCATA PLYWOOD MULTIPLEX COMBICORE WBP 18x1220x2440	M3	GPAK	200	95
180	FGP00917	ALBASIA FALCATA PLYWOOD WBP 40x1040x2440	M3	GPAK	200	95
181	FGP00933	ALBASIA FALCATA PLYWOOD WBP COMBICORE MULTIPLEX 18.5x1220x2440	M3	GPAK	200	95
182	FGP00945	ALBASIA FALCATA PLYWOOD MULTIPLEX MRE 9x1220x2500	M3	GPAK	200	95
183	FGP00946	ALBASIA FALCATA PLYWOOD MULTIPLEX MRE 18x1220x2500	M3	GPAK	200	95
184	FGP00947	ALBASIA FALCATA PLYWOOD MULTIPLEX WBP 18x1220x2440	M3	GPAK	200	95
185	FGP00955	ALBASIA FALCATA PLYWOOD MRE 18x920x2135	M3	GPAK	200	95
186	FGP00957	ALBASIA FALCATA PLYWOOD MULTIPLEX WBP 18x1220x2440	M3	GPAK	200	95
187	FGP00961	ALBASIA FALCATA PLYWOOD MULTIPLEX F*4 9x1220x2440	M3	GPAK	200	95
188	FGP00962	ALBASIA FALCATA PLYWOOD MULTIPLEX WBP 12x1220x2440	M3	GPAK	200	95
189	FGP00963	ALBASIA FALCATA PLYWOOD MULTIPLEX F*4 15x1220x2440	M3	GPAK	200	95
191	FGP00974	ALBASIA FALCATA PLYWOOD MRE 40x1000x2400	M3	GPAK	200	95
192	FGP00975	ALBASIA FALCATA PLYWOOD MRE 30x1220x2440	M3	GPAK	200	95
193	FGP00976	ALBASIA FALCATA PLYWOOD MRE 50x1220x2440	M3	GPAK	200	95
194	FGP00986	ALBASIA FALCATA PLYWOOD WBP 8x1220x2500	M3	GPAK	200	95
195	FGP00987	ALBASIA FALCATA PLYWOOD WBP 10x1220x2500	M3	GPAK	200	95
196	FGP00988	ALBASIA FALCATA PLYWOOD WBP 12x1220x2500	M3	GPAK	200	95
197	FGP00989	ALBASIA FALCATA PLYWOOD WBP 15x1220x2500	M3	GPAK	200	95
198	FGP00990	ALBASIA FALCATA PLYWOOD WBP 18x1220x2500	M3	GPAK	200	95
199	FGP00991	ALBASIA FALCATA PLYWOOD WBP 25x1220x2500	M3	GPAK	200	95
200	FGP00992	ALBASIA FALCATA PLYWOOD WBP 30x1220x2500	M3	GPAK	200	95
201	FGP00999	ALBASIA FALCATA PLYWOOD COMBICORE MDF WBP 18x1220x2440	M3	GPAK	200	95
202	FGP01019	ALBASIA FALCATA PLYWOOD MULTIPLEX WBP  19.1x1245x2464	M3	GPAK	200	95
203	FGP01020	ALBASIA FALCATA PLYWOOD MULTIPLEX MRE 20x1220x2500	M3	GPAK	200	95
204	FGP01021	ALBASIA FALCATA PLYWOOD MULTIPLEX MRE 22x1220x2500	M3	GPAK	200	95
205	FGP01023	ALBASIA FALCATA PLYWOOD MULTIPLEX MRE 18x1220x2440	M3	GPAK	200	95
206	FGP01025	ALBASIA FALCATA PLYWOOD MRE 40x1220x2440	M3	GPAK	200	95
207	FGP01031	ALBASIA FALCATA PLYWOOD MDF WBP 17.5x1232x3061	M3	GPAK	200	95
208	FGP01048	ALBASIA FALCATA PLYWOOD WBP 19.1x1245x2464	M3	GPAK	150	127
190	FGP00973	ALBASIA FALCATA PLYWOOD MRE 16.5x1225x2445	M3	GPAK	150	127
\.


--
-- TOC entry 5148 (class 0 OID 278631)
-- Dependencies: 236
-- Data for Name: machines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.machines (id, machine_code, machine_name, department) FROM stdin;
1	MCN0001	INSPECTION	Final Inspection
3	MCN0002	ASSEMBLY	Assembly
\.


--
-- TOC entry 5150 (class 0 OID 278643)
-- Dependencies: 238
-- Data for Name: operations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.operations (id, operation_name, department) FROM stdin;
3	PACKING	GPAK
2	ASSEMBLY	WIPA
1	FI	PFIN
\.


--
-- TOC entry 5134 (class 0 OID 57359)
-- Dependencies: 222
-- Data for Name: production_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.production_reports (id, production_no, status_po, sales_order_no, buyer_code, buyer_name, status_so, so_cancel, checkin_no, checkout_no, doc_date, bulan, shift, operator_name, koordinator, no_proses, workcenter, workcenter2, route, mesin, unit_mesin, kategori, item_code, item_description, vol_per_pcs, input_pcs, input_volume, output_pcs, output_volume, valid_qty_pcs, valid_qty, reject_pcs, reject_volume, created_at, status_check_out, line_id, updated_at) FROM stdin;
16	251000023	Closed	241000021	CL00008	KARYA SUTARINDO, PT	Closed	f	250004043	250004207	2025-01-14	January-2025	SHF-02	IMAM NUR S	AHMAD TEGUH SUSANTO	110	HOTPRESS_PANEL	HOTPRESS_PANEL	PLYWOOD	HOTPRESS	HOT PRESS COLUMBIA	Plywood	FGP00379	FG PLYWOOD WBP 4X1220X2440	0.01	70	0.83	64	0.76	64	0.76	6	0.07	2026-01-26 09:14:43.296	Open	\N	\N
17	251000023	Closed	241000021	CL00008	KARYA SUTARINDO, PT	Closed	f	250004470	250004643	2025-01-15	January-2025	SHF-02	KHABIB NAZARRUDIN	MUH. ZAIDIN RIDWAN	140	BLOW_DETECTOR_PANEL	BLOW_DETECTOR_PANEL	PLYWOOD	BLOW_DETECTOR	BLOW DETECTOR	Plywood	FGP00379	FG PLYWOOD WBP 4X1220X2440	0.01	177	2.11	145	1.73	145	1.73	32	0.38	2026-01-26 09:14:43.296	Open	\N	\N
\.


--
-- TOC entry 5168 (class 0 OID 417961)
-- Dependencies: 256
-- Data for Name: public_holidays; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.public_holidays (id, holiday_date, description, created_at) FROM stdin;
11	2026-04-10	liburan ngapa	2026-04-14 08:59:08.25426
13	2026-04-20	Magang Libur	2026-04-16 10:44:34.421787
15	2026-04-22	Cuti Hari Kartini	2026-04-17 13:14:50.171985
16	2026-04-21	Libur Hari Kartini	2026-04-17 13:15:21.687108
\.


--
-- TOC entry 5146 (class 0 OID 278585)
-- Dependencies: 234
-- Data for Name: sales_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_order_items (id, sales_order_id, item_id, quantity, pcs) FROM stdin;
1	1	154	8.97	196
2	1	156	20.26	369
3	1	152	15.63	427
4	4	166	54.32	972
5	5	166	52.31	936
6	6	166	52.31	936
7	7	166	52.31	936
8	8	166	52.31	936
9	9	166	52.31	936
10	10	166	52.31	936
11	11	166	52.31	936
12	12	166	52.31	936
13	13	166	52.31	936
14	14	166	52.31	936
15	15	166	52.31	936
16	16	166	52.31	936
17	17	166	52.31	936
18	18	166	52.31	936
19	19	166	52.31	936
20	20	181	1.10	20
21	21	156	51.77	943
22	22	114	26.85	324
23	22	121	28.29	216
24	24	118	29.32	456
25	24	115	28.86	408
26	26	135	0.00	161
27	26	133	0.00	160
28	26	134	0.00	162
29	29	116	58.65	720
30	30	115	57.72	816
31	31	208	0.00	972
32	32	186	5.09	95
33	32	188	5.18	145
34	34	186	5.09	95
35	35	99	52.78	696
36	36	105	53.27	702
37	37	108	28.29	216
38	37	114	26.85	324
39	39	105	53.27	702
40	40	105	53.27	702
41	41	106	55.70	648
42	42	114	26.85	324
43	42	108	28.29	216
44	44	105	8.20	108
45	44	114	17.90	216
46	44	108	28.29	216
47	47	108	28.29	216
48	47	106	27.85	324
49	49	102	28.69	432
50	49	106	23.21	270
51	51	141	10.00	280
52	52	107	28.20	324
53	52	103	25.13	324
54	54	122	52.91	668
55	55	160	56.33	2250
56	56	160	56.33	2250
57	57	187	0.00	145
58	58	160	56.33	2250
59	59	160	56.33	2250
60	60	160	56.33	2250
61	61	160	56.33	2250
62	62	160	56.33	2250
63	63	160	56.33	2250
64	64	160	56.33	2250
65	65	160	56.33	2250
66	66	173	54.07	1620
67	67	171	15.91	324
68	68	190	53.37	1080
69	69	153	6.56	147
70	69	155	32.95	615
71	71	135	0.00	414
72	72	133	0.00	288
73	72	134	0.00	243
74	74	108	28.29	216
75	74	106	27.85	324
76	76	108	28.29	216
77	76	106	27.85	324
78	78	207	0.00	612
79	79	115	57.72	816
80	80	117	58.22	984
81	81	115	57.72	816
82	82	116	58.65	720
83	83	118	29.32	456
84	83	130	28.30	528
85	85	116	58.65	720
86	86	170	51.56	1127
\.


--
-- TOC entry 5144 (class 0 OID 278567)
-- Dependencies: 232
-- Data for Name: sales_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_orders (id, so_number, so_date, customer_id, delivery_date, status) FROM stdin;
1	241000001	2024-04-29	337	2024-05-31	OPEN
4	241000029	2024-12-17	391	2025-01-31	OPEN
5	251000077	2025-02-24	391	2025-03-31	OPEN
6	251000078	2025-02-24	391	2025-03-31	OPEN
7	251000079	2025-02-24	391	2025-03-31	OPEN
8	251000080	2025-02-24	391	2025-04-30	OPEN
9	251000081	2025-02-24	391	2025-04-30	OPEN
10	251000086	2025-02-24	391	2025-05-31	OPEN
11	251000087	2025-02-24	391	2025-05-31	OPEN
12	251000088	2025-02-24	391	2025-05-31	OPEN
13	251000089	2025-02-24	391	2025-06-30	OPEN
14	251000090	2025-02-24	391	2025-06-30	OPEN
15	251000091	2025-02-24	391	2025-06-30	OPEN
16	251000092	2025-02-24	391	2025-06-30	OPEN
17	251000093	2025-02-24	391	2025-07-31	OPEN
18	251000094	2025-02-24	391	2025-07-31	OPEN
19	251000095	2025-02-24	391	2025-07-31	OPEN
20	251000284	2025-07-01	406	2025-07-31	OPEN
21	251000319	2025-08-13	336	2025-11-30	OPEN
22	251000456	2025-11-26	381	2026-02-28	OPEN
24	251000482	2025-12-18	360	2026-03-31	OPEN
26	251000486	2025-12-29	369	2026-01-31	OPEN
29	261000007	2026-01-08	360	2026-04-30	OPEN
30	261000008	2026-01-08	360	2026-04-30	OPEN
31	261000015	2026-01-21	379	2026-02-28	OPEN
32	261000023	2026-02-03	129	2026-02-28	OPEN
34	261000024	2026-02-03	129	2026-02-28	OPEN
35	261000025	2026-02-03	381	2026-03-31	OPEN
36	261000027	2026-02-05	381	2026-03-31	OPEN
37	261000029	2026-02-05	381	2026-03-31	OPEN
39	261000032	2026-02-05	381	2026-04-30	OPEN
40	261000033	2026-02-05	381	2026-04-30	OPEN
41	261000035	2026-02-09	381	2026-04-30	OPEN
42	261000036	2026-02-09	381	2026-04-30	OPEN
44	261000037	2026-02-09	381	2026-04-30	OPEN
47	261000039	2026-02-09	381	2026-04-30	OPEN
49	261000040	2026-02-09	381	2026-03-31	OPEN
51	261000046	2026-02-17	112	2026-03-31	OPEN
52	261000053	2026-02-24	392	2026-03-31	OPEN
54	261000054	2026-02-24	350	2026-03-31	OPEN
55	261000060	2026-03-05	397	2026-04-30	OPEN
56	261000061	2026-03-05	397	2026-04-30	OPEN
57	261000062	2026-03-05	129	2026-03-31	OPEN
58	261000064	2026-03-05	397	2026-04-30	OPEN
59	261000065	2026-03-05	397	2026-04-30	OPEN
60	261000066	2026-03-05	397	2026-05-31	OPEN
61	261000067	2026-03-05	397	2026-05-31	OPEN
62	261000068	2026-03-05	397	2026-06-30	OPEN
63	261000069	2026-03-05	397	2026-06-30	OPEN
64	261000070	2026-03-05	397	2026-07-31	OPEN
65	261000071	2026-03-05	397	2026-07-31	OPEN
66	261000072	2026-03-05	397	2026-04-30	OPEN
67	261000075	2026-03-12	412	2026-03-31	OPEN
68	261000081	2026-03-17	407	2026-05-31	OPEN
69	261000086	2026-03-27	413	2026-05-31	OPEN
71	261000090	2026-04-02	369	2026-05-31	OPEN
72	261000091	2026-04-02	369	2026-05-31	OPEN
74	261000092	2026-04-02	381	2026-04-30	OPEN
76	261000093	2026-04-02	381	2026-04-30	OPEN
78	261000102	2026-04-15	379	2026-07-31	OPEN
79	261000104	2026-04-16	360	2026-05-31	OPEN
80	261000105	2026-04-16	360	2026-06-30	OPEN
81	261000106	2026-04-16	360	2026-06-30	OPEN
82	261000107	2026-04-16	360	2026-07-31	OPEN
83	261000108	2026-04-16	360	2026-07-31	OPEN
85	261000109	2026-04-16	360	2026-07-31	OPEN
86	261000110	2026-04-16	336	2026-05-31	OPEN
\.


--
-- TOC entry 5132 (class 0 OID 49165)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, username, password, email, nama_lengkap, last_login, created_at, updated_at, role) FROM stdin;
3	admin	$2b$10$RRllqvzGrF.nKnGw3NYjeOsu1aKKqLSBg6O/bWiSif36cUGF9X7tu	admin@gmail.com	FAdmin	2026-04-15 09:47:00.417033	2026-02-12 08:53:57.08169	2026-03-16 09:24:14.554668	Admin
1	rafi	$2b$10$0G8FIp6mAjEc58ZT7FTrPOohi/cd5rwr5kbZ2FfujvNt0LG73JXou	ahmadrafi47@example.com	Ryoman Ayu Carmenita	2026-04-09 12:41:55.310191	2025-12-18 11:24:48.67582	2026-03-16 09:24:02.271677	Reporter
6	ppic	$2b$10$yT6Fcu7KDeIVV0962uBd0u1KPKTN64k46j1fU2M8nuwQXa/OC3xL.	ppic@bahana.co.id	IJohn Wick	2026-03-31 13:55:16.242808	2026-03-09 09:14:19.420636	2026-03-16 09:24:21.368895	Planner
2	carmen	$2b$10$qZMvAtO9rBRbFJLNTDbMmONeT1Y5V94w8d.v0z94Z1Y4tn1SYWUR2	carmen@gmail.com	Aarmen	2026-04-20 10:00:55.013627	2026-01-30 08:19:58.644904	2026-03-16 09:24:08.794156	Planner
\.


--
-- TOC entry 5170 (class 0 OID 417980)
-- Dependencies: 258
-- Data for Name: work_centers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_centers (id, work_center_name, line_name, lead_time, ewh, yield, description, updated_at, total_lines, percentage, ewh_final) FROM stdin;
3	Assembly Pannel	GLUE, COLD, HOT	7	80	96.00	ksj	2026-04-15 08:24:02.958009	3	40.00	24192.00
2	Finishing	SEIZING, BLOW, IMEAS, DEMPUL	3	80	90.00	ada	2026-04-15 08:24:31.706799	1	100.00	20160.00
1	Packing	PACKING	1	80	95.00	okey	2026-04-15 08:24:40.221272	1	100.00	20160.00
4	Assembly Core	GLUE, COLD, HOT	0	80	93.00	jsj	2026-04-15 08:47:05.036149	3	60.00	36288.00
\.


--
-- TOC entry 5195 (class 0 OID 0)
-- Dependencies: 225
-- Name: bill_of_materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bill_of_materials_id_seq', 3156, true);


--
-- TOC entry 5196 (class 0 OID 0)
-- Dependencies: 227
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 414, true);


--
-- TOC entry 5197 (class 0 OID 0)
-- Dependencies: 245
-- Name: demand_item_assembly_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.demand_item_assembly_id_seq', 110, true);


--
-- TOC entry 5198 (class 0 OID 0)
-- Dependencies: 243
-- Name: demand_item_finishing_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.demand_item_finishing_id_seq', 338, true);


--
-- TOC entry 5199 (class 0 OID 0)
-- Dependencies: 241
-- Name: demand_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.demand_items_id_seq', 783, true);


--
-- TOC entry 5200 (class 0 OID 0)
-- Dependencies: 239
-- Name: demands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.demands_id_seq', 442, true);


--
-- TOC entry 5201 (class 0 OID 0)
-- Dependencies: 223
-- Name: grpo_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.grpo_reports_id_seq', 20, true);


--
-- TOC entry 5202 (class 0 OID 0)
-- Dependencies: 249
-- Name: item_assembly_core_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.item_assembly_core_id_seq', 124, true);


--
-- TOC entry 5203 (class 0 OID 0)
-- Dependencies: 247
-- Name: item_assembly_pannel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.item_assembly_pannel_id_seq', 128, true);


--
-- TOC entry 5204 (class 0 OID 0)
-- Dependencies: 251
-- Name: item_finishing_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.item_finishing_id_seq', 135, true);


--
-- TOC entry 5205 (class 0 OID 0)
-- Dependencies: 253
-- Name: item_routings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.item_routings_id_seq', 122, true);


--
-- TOC entry 5206 (class 0 OID 0)
-- Dependencies: 229
-- Name: items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.items_id_seq', 208, true);


--
-- TOC entry 5207 (class 0 OID 0)
-- Dependencies: 235
-- Name: machines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.machines_id_seq', 3, true);


--
-- TOC entry 5208 (class 0 OID 0)
-- Dependencies: 237
-- Name: operations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.operations_id_seq', 3, true);


--
-- TOC entry 5209 (class 0 OID 0)
-- Dependencies: 221
-- Name: production_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.production_reports_id_seq', 53, true);


--
-- TOC entry 5210 (class 0 OID 0)
-- Dependencies: 255
-- Name: public_holidays_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.public_holidays_id_seq', 16, true);


--
-- TOC entry 5211 (class 0 OID 0)
-- Dependencies: 233
-- Name: sales_order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sales_order_items_id_seq', 86, true);


--
-- TOC entry 5212 (class 0 OID 0)
-- Dependencies: 231
-- Name: sales_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sales_orders_id_seq', 86, true);


--
-- TOC entry 5213 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 6, true);


--
-- TOC entry 5214 (class 0 OID 0)
-- Dependencies: 257
-- Name: work_centers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.work_centers_id_seq', 5, true);


--
-- TOC entry 4920 (class 2606 OID 221207)
-- Name: bill_of_materials bill_of_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_of_materials
    ADD CONSTRAINT bill_of_materials_pkey PRIMARY KEY (id);


--
-- TOC entry 4922 (class 2606 OID 278551)
-- Name: customers customers_customer_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_customer_code_key UNIQUE (customer_code);


--
-- TOC entry 4924 (class 2606 OID 278549)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- TOC entry 4951 (class 2606 OID 344385)
-- Name: demand_item_assembly demand_item_assembly_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demand_item_assembly
    ADD CONSTRAINT demand_item_assembly_pkey PRIMARY KEY (id);


--
-- TOC entry 4948 (class 2606 OID 344295)
-- Name: demand_item_finishing demand_item_finishing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demand_item_finishing
    ADD CONSTRAINT demand_item_finishing_pkey PRIMARY KEY (id);


--
-- TOC entry 4946 (class 2606 OID 294942)
-- Name: demand_items demand_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demand_items
    ADD CONSTRAINT demand_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4942 (class 2606 OID 294931)
-- Name: demands demands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demands
    ADD CONSTRAINT demands_pkey PRIMARY KEY (id);


--
-- TOC entry 4914 (class 2606 OID 180262)
-- Name: grpo_reports grpo_reports_conflict_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grpo_reports
    ADD CONSTRAINT grpo_reports_conflict_unique UNIQUE (tgl_grpo, no_grpo, kode_item, whs);


--
-- TOC entry 4916 (class 2606 OID 114721)
-- Name: grpo_reports grpo_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grpo_reports
    ADD CONSTRAINT grpo_reports_pkey PRIMARY KEY (id);


--
-- TOC entry 4958 (class 2606 OID 344474)
-- Name: item_assembly_core item_assembly_core_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_assembly_core
    ADD CONSTRAINT item_assembly_core_pkey PRIMARY KEY (id);


--
-- TOC entry 4954 (class 2606 OID 344407)
-- Name: item_assembly_pannel item_assembly_pannel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_assembly_pannel
    ADD CONSTRAINT item_assembly_pannel_pkey PRIMARY KEY (id);


--
-- TOC entry 4960 (class 2606 OID 344486)
-- Name: item_finishing item_finishing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_finishing
    ADD CONSTRAINT item_finishing_pkey PRIMARY KEY (id);


--
-- TOC entry 4963 (class 2606 OID 344496)
-- Name: item_routings item_routings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_routings
    ADD CONSTRAINT item_routings_pkey PRIMARY KEY (id);


--
-- TOC entry 4926 (class 2606 OID 278565)
-- Name: items items_item_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_item_code_key UNIQUE (item_code);


--
-- TOC entry 4928 (class 2606 OID 278563)
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- TOC entry 4936 (class 2606 OID 278641)
-- Name: machines machines_machine_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.machines
    ADD CONSTRAINT machines_machine_code_key UNIQUE (machine_code);


--
-- TOC entry 4938 (class 2606 OID 278639)
-- Name: machines machines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.machines
    ADD CONSTRAINT machines_pkey PRIMARY KEY (id);


--
-- TOC entry 4940 (class 2606 OID 278651)
-- Name: operations operations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operations
    ADD CONSTRAINT operations_pkey PRIMARY KEY (id);


--
-- TOC entry 4910 (class 2606 OID 57368)
-- Name: production_reports production_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_reports
    ADD CONSTRAINT production_reports_pkey PRIMARY KEY (id);


--
-- TOC entry 4912 (class 2606 OID 155661)
-- Name: production_reports production_reports_unique_doc_prod_so_item_mesin; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_reports
    ADD CONSTRAINT production_reports_unique_doc_prod_so_item_mesin UNIQUE (doc_date, production_no, sales_order_no, item_code, mesin);


--
-- TOC entry 4965 (class 2606 OID 417971)
-- Name: public_holidays public_holidays_holiday_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.public_holidays
    ADD CONSTRAINT public_holidays_holiday_date_key UNIQUE (holiday_date);


--
-- TOC entry 4967 (class 2606 OID 417969)
-- Name: public_holidays public_holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.public_holidays
    ADD CONSTRAINT public_holidays_pkey PRIMARY KEY (id);


--
-- TOC entry 4934 (class 2606 OID 278591)
-- Name: sales_order_items sales_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_order_items
    ADD CONSTRAINT sales_order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4930 (class 2606 OID 278576)
-- Name: sales_orders sales_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4932 (class 2606 OID 278578)
-- Name: sales_orders sales_orders_so_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_so_number_key UNIQUE (so_number);


--
-- TOC entry 4944 (class 2606 OID 393388)
-- Name: demands unique_so_number; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demands
    ADD CONSTRAINT unique_so_number UNIQUE (so_number);


--
-- TOC entry 4904 (class 2606 OID 49180)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4906 (class 2606 OID 49176)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4908 (class 2606 OID 49178)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4918 (class 2606 OID 180247)
-- Name: grpo_reports ux_grpo_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grpo_reports
    ADD CONSTRAINT ux_grpo_unique UNIQUE (tgl_grpo, no_grpo, kode_item, group_rotary, diameter);


--
-- TOC entry 4969 (class 2606 OID 417993)
-- Name: work_centers work_centers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_centers
    ADD CONSTRAINT work_centers_pkey PRIMARY KEY (id);


--
-- TOC entry 4971 (class 2606 OID 417995)
-- Name: work_centers work_centers_work_center_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_centers
    ADD CONSTRAINT work_centers_work_center_name_key UNIQUE (work_center_name);


--
-- TOC entry 4952 (class 1259 OID 344396)
-- Name: idx_assembly_demand_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assembly_demand_id ON public.demand_item_assembly USING btree (demand_id);


--
-- TOC entry 4949 (class 1259 OID 344306)
-- Name: idx_finishing_demand_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_finishing_demand_id ON public.demand_item_finishing USING btree (demand_id);


--
-- TOC entry 4956 (class 1259 OID 344475)
-- Name: idx_unique_assembly_code_core; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_unique_assembly_code_core ON public.item_assembly_core USING btree (assembly_code);


--
-- TOC entry 4955 (class 1259 OID 344408)
-- Name: unique_assembly_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_assembly_code ON public.item_assembly_pannel USING btree (assembly_code);


--
-- TOC entry 4961 (class 1259 OID 344487)
-- Name: unique_finishing_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_finishing_code ON public.item_finishing USING btree (finishing_code);


--
-- TOC entry 4978 (class 2606 OID 344386)
-- Name: demand_item_assembly demand_item_assembly_demand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demand_item_assembly
    ADD CONSTRAINT demand_item_assembly_demand_id_fkey FOREIGN KEY (demand_id) REFERENCES public.demands(id) ON DELETE CASCADE;


--
-- TOC entry 4979 (class 2606 OID 344391)
-- Name: demand_item_assembly demand_item_assembly_demand_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demand_item_assembly
    ADD CONSTRAINT demand_item_assembly_demand_item_id_fkey FOREIGN KEY (demand_item_id) REFERENCES public.demand_items(id) ON DELETE CASCADE;


--
-- TOC entry 4976 (class 2606 OID 344296)
-- Name: demand_item_finishing demand_item_finishing_demand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demand_item_finishing
    ADD CONSTRAINT demand_item_finishing_demand_id_fkey FOREIGN KEY (demand_id) REFERENCES public.demands(id) ON DELETE CASCADE;


--
-- TOC entry 4977 (class 2606 OID 344301)
-- Name: demand_item_finishing demand_item_finishing_demand_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demand_item_finishing
    ADD CONSTRAINT demand_item_finishing_demand_item_id_fkey FOREIGN KEY (demand_item_id) REFERENCES public.demand_items(id) ON DELETE CASCADE;


--
-- TOC entry 4975 (class 2606 OID 344275)
-- Name: demand_items demand_items_demand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demand_items
    ADD CONSTRAINT demand_items_demand_id_fkey FOREIGN KEY (demand_id) REFERENCES public.demands(id) ON DELETE CASCADE;


--
-- TOC entry 4980 (class 2606 OID 344512)
-- Name: item_routings item_routings_assembly_code_core_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_routings
    ADD CONSTRAINT item_routings_assembly_code_core_fkey FOREIGN KEY (assembly_code_core) REFERENCES public.item_assembly_core(assembly_code);


--
-- TOC entry 4981 (class 2606 OID 344507)
-- Name: item_routings item_routings_assembly_code_pannel_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_routings
    ADD CONSTRAINT item_routings_assembly_code_pannel_fkey FOREIGN KEY (assembly_code_pannel) REFERENCES public.item_assembly_pannel(assembly_code);


--
-- TOC entry 4982 (class 2606 OID 344502)
-- Name: item_routings item_routings_finishing_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_routings
    ADD CONSTRAINT item_routings_finishing_code_fkey FOREIGN KEY (finishing_code) REFERENCES public.item_finishing(finishing_code);


--
-- TOC entry 4983 (class 2606 OID 344497)
-- Name: item_routings item_routings_item_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_routings
    ADD CONSTRAINT item_routings_item_code_fkey FOREIGN KEY (item_code) REFERENCES public.items(item_code);


--
-- TOC entry 4973 (class 2606 OID 278597)
-- Name: sales_order_items sales_order_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_order_items
    ADD CONSTRAINT sales_order_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- TOC entry 4974 (class 2606 OID 278592)
-- Name: sales_order_items sales_order_items_sales_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_order_items
    ADD CONSTRAINT sales_order_items_sales_order_id_fkey FOREIGN KEY (sales_order_id) REFERENCES public.sales_orders(id) ON DELETE CASCADE;


--
-- TOC entry 4972 (class 2606 OID 278579)
-- Name: sales_orders sales_orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


-- Completed on 2026-04-20 10:40:24

--
-- PostgreSQL database dump complete
--

\unrestrict MBbZOdgxOsAt4MDE3UelZccNp1wmVeke0qNJOK3AM4kqiP6clxC0y71hcigg9Ue

