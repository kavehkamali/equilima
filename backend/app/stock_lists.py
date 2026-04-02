"""
Stock universes: S&P 500, Mid Caps, Small Caps, TSX, Sectors.
"""

SP500 = [
    # Technology
    "AAPL", "MSFT", "NVDA", "GOOGL", "GOOG", "META", "AVGO", "ORCL", "CRM", "ADBE",
    "AMD", "CSCO", "ACN", "INTC", "TXN", "QCOM", "INTU", "AMAT", "ADI", "LRCX",
    "KLAC", "SNPS", "CDNS", "NXPI", "MCHP", "ON", "FTNT", "PANW", "NOW", "PLTR",
    "CRWD", "HPQ", "HPE", "KEYS", "CDW", "ZBRA", "EPAM", "IT", "AKAM", "JNPR",
    "GEN", "SWKS", "FFIV", "NTAP", "WDC", "STX", "ENPH",
    # Healthcare
    "UNH", "JNJ", "LLY", "ABBV", "MRK", "TMO", "ABT", "DHR", "AMGN", "PFE",
    "GILD", "VRTX", "REGN", "ISRG", "SYK", "BDX", "ZTS", "BSX", "CI", "HUM",
    "BMY", "BIIB", "MRNA", "EW", "BAX", "MDT", "A", "IQV", "DXCM", "IDXX",
    "MTD", "HOLX", "ALGN", "TFX", "HSIC", "XRAY", "DGX", "LH", "COO", "RMD",
    "PODD", "TECH", "BIO", "INCY", "CRL", "MOH", "CNC", "HCA", "ELV",
    # Financials
    "JPM", "V", "MA", "BRK-B", "BAC", "WFC", "MS", "GS", "SCHW", "C",
    "AXP", "BLK", "SPGI", "CME", "ICE", "CB", "PNC", "USB", "TFC", "AIG",
    "MMC", "AON", "MET", "PRU", "AFL", "ALL", "TRV", "MSCI", "FIS", "NDAQ",
    "MCO", "CINF", "CFG", "KEY", "RF", "FITB", "HBAN", "MTB", "ZION", "CMA",
    "RE", "L", "GL", "WRB", "BEN", "IVZ", "TROW",
    # Consumer Discretionary
    "AMZN", "TSLA", "HD", "MCD", "NKE", "LOW", "SBUX", "TJX", "BKNG", "CMG",
    "ORLY", "AZO", "ROST", "DHI", "LEN", "PHM", "GPC", "POOL", "BBY", "ULTA",
    "DRI", "YUM", "DARDEN", "HLT", "MAR", "H", "RCL", "CCL", "NCLH", "MGM",
    "WYNN", "LVS", "F", "GM", "APTV", "BWA", "LEA", "RL", "PVH", "TPR",
    "GRMN", "HAS", "EBAY", "ETSY",
    # Consumer Staples
    "PG", "KO", "PEP", "COST", "WMT", "PM", "MO", "CL", "MDLZ", "KMB",
    "GIS", "K", "HSY", "CPB", "SJM", "CAG", "HRL", "KHC", "STZ", "BF-B",
    "TAP", "ADM", "TSN", "KR", "SYY", "WBA", "EL", "CLX", "CHD", "MKC",
    # Energy
    "XOM", "CVX", "COP", "SLB", "EOG", "PSX", "VLO", "MPC", "HAL", "OXY",
    "DVN", "FANG", "HES", "BKR", "CTRA", "APA", "MRO", "TRGP", "WMB", "KMI",
    "OKE", "LNG",
    # Industrials
    "CAT", "BA", "GE", "HON", "UNP", "UPS", "DE", "RTX", "LMT", "NOC",
    "EMR", "ITW", "GD", "FDX", "WM", "NSC", "CSX", "ETN", "PH", "ROK",
    "IR", "AME", "FAST", "SWK", "IEX", "NDSN", "GWW", "PCAR", "ODFL", "CHRW",
    "EXPD", "JBHT", "TDG", "HWM", "TXT", "LHX", "HII", "DOV", "XYL", "VRSK",
    # Utilities
    "NEE", "SO", "DUK", "AEP", "D", "SRE", "EXC", "ED", "XEL", "WEC",
    "ES", "PPL", "AES", "FE", "CMS", "DTE", "EVRG", "ATO", "NI", "PNW",
    "LNT",
    # Real Estate
    "PLD", "AMT", "CCI", "SPG", "EQIX", "PSA", "O", "DLR", "WELL", "ARE",
    "VTR", "AVB", "EQR", "MAA", "UDR", "ESS", "REG", "FRT", "KIM", "BXP",
    "SLG", "VNO", "HST", "PEAK", "CPT", "IRM", "SBAC",
    # Communication Services
    "GOOGL", "META", "DIS", "NFLX", "CMCSA", "T", "VZ", "TMUS", "CHTR", "EA",
    "TTWO", "MTCH", "WBD", "PARA", "FOX", "FOXA", "IPG", "OMC", "LYV",
    # Materials
    "LIN", "APD", "SHW", "ECL", "FCX", "NEM", "NUE", "STLD", "CF", "MOS",
    "ALB", "FMC", "CE", "EMN", "PPG", "VMC", "MLM", "DOW", "DD", "CTVA",
    "IFF", "AVY", "SEE", "PKG", "IP", "WRK", "BLL",
]

MID_CAPS = [
    # Popular mid-cap growth
    "DDOG", "ZS", "NET", "BILL", "HUBS", "VEEV", "PAYC", "PCTY", "SSNC", "TOST",
    "DUOL", "APP", "CELH", "ONON", "DECK", "CASY", "TXRH", "WING", "ELF", "LULU",
    "WDAY", "OKTA", "MDB", "SNOW", "DOCU", "ZM", "ROKU", "PINS", "SNAP", "RBLX",
    # Mid-cap value
    "ALLY", "OZK", "FHN", "SNV", "ASB", "PNFP", "UMBF", "CBSH", "IBKR",
    "RBC", "ACM", "TTEK", "BWXT", "KBR", "LDOS", "SAIC", "BAH", "CACI",
    "WSO", "RRX", "WCC", "AIT", "GATX", "GGG", "MIDD",
    # Mid-cap biotech/health
    "EXAS", "NBIX", "PCVX", "SRPT", "RARE", "UTHR", "HALO", "MASI", "NVCR",
    "GMED", "LIVN", "ITGR", "OMCL", "PRGO", "Jazz",
]

SMALL_CAPS = [
    # Popular small-cap growth
    "SMCI", "IONQ", "RGTI", "SOUN", "BBAI", "ASTS", "LUNR", "RKLB", "AEHR",
    "ACHR", "JOBY", "BLDE", "EVTL", "LILM",
    "UPST", "SOFI", "AFRM", "LC", "OPEN", "CLOV",
    "CRSP", "BEAM", "NTLA", "EDIT", "VERV", "FATE",
    "DM", "XONE", "MKFG", "NNDM",
    "QS", "MVST", "AMPX", "DCFC",
    "DNA", "BNGO", "OUST",
    # Small-cap value / dividend
    "OLP", "STAG", "GOOD", "GTY", "PINE", "EPRT",
    "SBRA", "CTRE", "LTC", "NHI",
    "BANF", "BUSE", "WASH", "NWBI", "FFBC", "SRCE", "FULT", "WSBC",
    # Small-cap energy
    "NEXT", "RUN", "NOVA", "ARRY", "SHLS", "SEDG",
    "SM", "MTDR", "CHRD", "ESTE", "VTLE", "CIVI",
    # Small-cap consumer
    "BROS", "SHAK", "JACK", "CAKE", "DENN", "EAT", "PLAY",
    "CROX", "SKX", "FOXF", "HIBB", "BOOT", "PLBY",
    # Small-cap tech
    "ASAN", "FROG", "BRZE", "CWAN", "ALKT", "PRGS", "MTTR",
    "VERI", "BIGC", "GDYN", "GLOB", "TASK",
    # Small-cap industrial
    "ATKR", "AIMC", "UFPT", "ROCK", "KFRC", "HRI", "MGRC",
]

TSX60 = [
    "RY.TO", "TD.TO", "BNS.TO", "BMO.TO", "CM.TO", "MFC.TO", "SLF.TO", "GWO.TO",
    "CNR.TO", "CP.TO", "ENB.TO", "TRP.TO", "SU.TO", "CNQ.TO", "IMO.TO",
    "ABX.TO", "FNV.TO", "WPM.TO", "NTR.TO", "POW.TO",
    "BCE.TO", "T.TO", "RCI-B.TO",
    "SHOP.TO", "CSU.TO", "OTEX.TO",
    "BAM.TO", "BN.TO", "BIP-UN.TO", "BEP-UN.TO",
    "ATD.TO", "L.TO", "DOL.TO", "MRU.TO",
    "WSP.TO", "SNC.TO", "STN.TO",
    "FTS.TO", "EMA.TO", "H.TO", "AQN.TO",
    "WCN.TO", "GFL.TO",
    "SAP.TO", "CCL-B.TO", "TIH.TO", "IFC.TO",
    "AC.TO", "QSR.TO", "MG.TO", "DOO.TO", "TFI.TO",
]

SECTORS = {
    "Technology": [s for s in SP500[:47]],
    "Healthcare": [s for s in SP500[47:96]],
    "Financials": [s for s in SP500[96:143]],
    "Consumer Disc.": [s for s in SP500[143:187]],
    "Consumer Staples": [s for s in SP500[187:217]],
    "Energy": [s for s in SP500[217:239]],
    "Industrials": [s for s in SP500[239:281]],
    "Utilities": [s for s in SP500[281:302]],
    "Real Estate": [s for s in SP500[302:329]],
    "Comm. Services": [s for s in SP500[329:348]],
    "Materials": [s for s in SP500[348:]],
}

# Deduplicate
_all_unique = list(dict.fromkeys(SP500 + MID_CAPS + SMALL_CAPS + TSX60))

LISTS = {
    "all": {"name": "All Stocks", "symbols": _all_unique},
    "sp500": {"name": "S&P 500", "symbols": list(dict.fromkeys(SP500))},
    "midcap": {"name": "Mid Caps", "symbols": MID_CAPS},
    "smallcap": {"name": "Small Caps", "symbols": SMALL_CAPS},
    "tsx60": {"name": "TSX 60 (Canada)", "symbols": TSX60},
}

for sector_name, sector_symbols in SECTORS.items():
    key = f"sector_{sector_name.lower().replace(' ', '_').replace('.', '')}"
    LISTS[key] = {"name": sector_name, "symbols": sector_symbols}
