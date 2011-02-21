/* Copyright 2011 Lennart Coopmans
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function( $ ){

    var idCounter = 0;

	$.fn.fasthtml = function(htmlstr) {
		if (!htmlstr) return this.html();
		if ($.browser.msie) return this.html(htmlstr); // use old html mode in IE
		
		oldEl = this[0];
		var newEl = oldEl.cloneNode(false);
		newEl.innerHTML = htmlstr;
		oldEl.parentNode.replaceChild(newEl, oldEl);
		this[0] = newEl;
		
		return this;
	}
	
})( jQuery );
