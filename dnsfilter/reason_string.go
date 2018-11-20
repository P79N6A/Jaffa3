package dnsfilter

import "strconv"

const _Reason_name = "NotFilteredNotFoundNotFilteredWhiteListNotFilteredErrorFilteredBlackListFilteredSafeBrowsingFilteredParentalFilteredInvalidFilteredSafeSearch"

var _Reason_index = [...]uint8{0, 19, 39, 55, 72, 92, 108, 123, 141}

func (i Reason) String() string {
	if i < 0 || i >= Reason(len(_Reason_index)-1) {
		return "Reason(" + strconv.FormatInt(int64(i), 10) + ")"
	}
	return _Reason_name[_Reason_index[i]:_Reason_index[i+1]]
}