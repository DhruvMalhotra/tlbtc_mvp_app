const viseme_dict = {
	0: "BMP",
	1: "AEI",
	2: "AEI",
	3: "O",
	4: "AEI", //or cd
	5: "EE",
	6: "CHJSH",
	7: "WQ",
	8: "WQ",
	9: "O",
	10: "WQ",
	11: "AEI",
	12: "CHJSH",
	13: "R",
	14: "L",
	15: "CDNS",
	16: "CHJSH",
	17: "TH",
	18: "FV",
	19: "CDNS",
	20: "GK",
	21: "BMP",
};

const frame_dict = {
	"CHJSH": 3,
	"TH": 10,
	"WQ": 8,
	"L": 6,
	"CDNS": 2,
	"U": 11,
	"O": 7,
	"FV": 5,
	"BMP": 1,
	"AEI": 0,
	"R": 9,
	"EE": 4,
	"GK": 2
}

export { viseme_dict, frame_dict };