var
	http = require("http"),
	https = require("https"),
	URL = require("url");

const MAX_REDIRECTS = 10;

var SimpleHttp = new function(){
	
	this.get = function( params, callback ){
		
		if( typeof params == "string" ){
			params = {
				url: params
			};
		}
		
		var countRedirects = 0;
		
		function _doReq(){
			
			if( countRedirects >= MAX_REDIRECTS ){
				console.log("ERRROR: too many redirects");
				
				return callback( null );
			}
			
			var via = null;
			
			var urlLower = params.url.toLowerCase();
			
			if( urlLower.indexOf("http://") === 0 ){
				via = http;
			}
			else if( urlLower.indexOf("https://") === 0 ){
				via = https;
			}
			
			if( !via ){
				console.log("ERRROR: fail get via for", urlLower);
				return callback( null );
			}
			
			var reqParams = URL.parse( params.url );
			reqParams.agent = false;
			reqParams.headers = {
			  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2"
			};
			
			var request = via.get( reqParams, function(){

			} );
			
			request.on("error", function( error ){
				callback( null );
			});
			
			request.on( "response", function( res ){

				if( !res ){
					return callback( null );
				}
				
				if( res.statusCode >= 300 && res.statusCode <= 399 &&
					"location" in res.headers ){
					
					params.url = URL.resolve( params.url, res.headers.location );
					
					countRedirects++;
					
					return _doReq();					
				}
				
				callback( res );
				
			} );
			
		}		
		
		_doReq();
		
	};
	
};

module.exports = SimpleHttp;
