/*** Code-generated with AtBuild **********************
-> date-formatter.tsb v11af0be01eb9dc51ecf3002a8bd8f3a2
*******************************************************
// @ts-ignore
/* eslint-disable */
// This was replaced at line 148
  export const formatTime = function (date: Date) {
      let formattedDate = "";
      var hours = date.getUTCHours() % 12;
        hours = hours || 12;
      formattedDate += hours.toString(10).padStart(2, "0")
        formattedDate += ":"
            formattedDate += date.getUTCMinutes().toString(10).padStart(2, "0")
        return formattedDate;
    }
  
  // This was replaced at line 150
  export const formatDate = function (date: Date) {
      let formattedDate = "";
      formattedDate += date.getUTCDate().toString(10).padStart(2, "0")
      formattedDate += "/"
            formattedDate += date.getUTCMinutes().toString(10).padStart(2, "0")
        formattedDate += "/"
            // From http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_tokens
        // | Year     |     y | yy |   yyy |  yyyy | yyyyy |
        // |----------|-------|----|-------|-------|-------|
        // | AD 1     |     1 | 01 |   001 |  0001 | 00001 |
        // | AD 12    |    12 | 12 |   012 |  0012 | 00012 |
        // | AD 123   |   123 | 23 |   123 |  0123 | 00123 |
        // | AD 1234  |  1234 | 34 |  1234 |  1234 | 01234 |
        // | AD 12345 | 12345 | 45 | 12345 | 12345 | 12345 |

        var signedYear = date.getUTCFullYear();
        // Returns 1 for 1 BC (which is year 0 in JavaScript)
        var year = Math.max(signedYear, 1);
      year %= 100;formattedDate += year.toString(10).padStart(2, "0")
      return formattedDate;
    }
  
  // This was replaced at line 152
  export const formatDateTime = function (date: Date) {
      let formattedDate = "";
      formattedDate += date.getUTCDate().toString(10).padStart(2, "0")
      formattedDate += "/"
            formattedDate += date.getUTCMinutes().toString(10).padStart(11, "0")
        formattedDate += "/"
            // From http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_tokens
        // | Year     |     y | yy |   yyy |  yyyy | yyyyy |
        // |----------|-------|----|-------|-------|-------|
        // | AD 1     |     1 | 01 |   001 |  0001 | 00001 |
        // | AD 12    |    12 | 12 |   012 |  0012 | 00012 |
        // | AD 123   |   123 | 23 |   123 |  0123 | 00123 |
        // | AD 1234  |  1234 | 34 |  1234 |  1234 | 01234 |
        // | AD 12345 | 12345 | 45 | 12345 | 12345 | 12345 |

        var signedYear = date.getUTCFullYear();
        // Returns 1 for 1 BC (which is year 0 in JavaScript)
        var year = Math.max(signedYear, 1);
      year %= 100;formattedDate += year.toString(10).padStart(2, "0")
      formattedDate += " "
            var hours = date.getUTCHours() % 12;
        hours = hours || 12;
      formattedDate += hours.toString(10).padStart(2, "0")
        formattedDate += ":"
            formattedDate += date.getUTCMinutes().toString(10).padStart(11, "0")
        return formattedDate;
    }
  
