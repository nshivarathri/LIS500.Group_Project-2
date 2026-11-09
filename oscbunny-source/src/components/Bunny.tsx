import {useId} from 'react';
export default function Bunny({thinking=false,small=false}:{thinking?:boolean;small?:boolean}){const id=useId().replace(/:/g,'');return <svg className={`bunny cozy-bunny ${thinking?'thinking':''} ${small?'mini':''}`} viewBox="0 0 430 360" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Oscbunny, a fluffy blushy lop-eared bunny loaf with 81 on his papaya hat, cuddling a letter" role="img">
<defs><radialGradient id={`${id}fur`} cx=".38" cy=".25" r=".85"><stop stopColor="#fffdf5"/><stop offset=".65" stopColor="#f9ecd7"/><stop offset="1" stopColor="#ead2b0"/></radialGradient><linearGradient id={`${id}ear`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#dbc4a4"/><stop offset=".5" stopColor="#cdb18f"/><stop offset="1" stopColor="#bfa07f"/></linearGradient><radialGradient id={`${id}blush`}><stop stopColor="#efa8a7" stopOpacity=".85"/><stop offset=".55" stopColor="#f2b4ae" stopOpacity=".55"/><stop offset="1" stopColor="#f3c7b9" stopOpacity="0"/></radialGradient><linearGradient id={`${id}cap`} x1="0" y1="0" x2=".6" y2="1"><stop stopColor="#f8b06f"/><stop offset="1" stopColor="#e99151"/></linearGradient></defs>
<ellipse cx="226" cy="324" rx="157" ry="14" fill="#c5a47e" opacity=".16"/>
<g className="bunny-body" stroke="#b19173" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
{/* A little cloud of a tail, tucked behind a soft loaf body. */}
<path d="M351 258q12-10 18 1q12-2 12 10q9 6 1 15q1 11-11 12q-8 10-17 2q-14 0-15-13Z" fill="#fff9e9" stroke="#cbb295"/>
<path d="M188 202Q226 163 278 184Q288 180 295 189Q308 185 315 198Q329 195 334 209Q348 211 349 227Q365 243 361 261Q374 284 355 301Q351 313 331 314Q318 324 299 319Q278 330 256 322Q229 329 213 317Q187 318 177 302Q159 292 166 270Z" fill={`url(#${id}fur)`}/>
<path d="M265 196q11-7 19 0m17 10q12-3 17 6m14 11q7 4 7 13m6 17q5 10-1 15" stroke="#fffaf0" strokeWidth="3" opacity=".9"/>
<path d="M230 254q12 14 20 36" stroke="#e1c8a7" strokeWidth="9"/>
{/* Heavy, floppy ears hang below the cheeks. No upright ears. */}
<g className="ears"><path d="M130 171Q109 154 94 181Q73 214 64 255Q56 284 75 291Q93 302 110 280Q130 252 138 215Z" fill={`url(#${id}ear)`}/><path d="M104 191Q87 228 78 267Q75 279 82 280" stroke="#dfc9b1" strokeWidth="9"/><path d="M240 169Q260 160 274 184Q297 222 303 264Q307 288 288 294Q269 300 255 276Q241 249 233 208Z" fill={`url(#${id}ear)`}/><path d="M267 194Q284 231 289 269Q290 280 283 282" stroke="#dfc9b1" strokeWidth="9"/></g>
{/* Scalloped cheeks give the face its soft, plush silhouette. */}
<path d="M111 222Q107 194 124 177Q122 165 139 161Q144 150 160 154Q176 145 190 153Q208 147 219 157Q237 155 243 171Q257 181 252 200Q262 220 252 239Q260 251 248 263Q250 277 234 281Q227 297 209 294Q191 304 175 297Q156 305 142 293Q124 297 119 283Q103 280 107 266Q94 254 104 242Q97 231 111 222Z" fill={`url(#${id}fur)`}/>
<path d="M120 222q-5 7-4 13m9-45q3-7 10-9m-11 81q-4-4-3-9m103 23q8-2 10-8" stroke="#fffdf4" strokeWidth="3"/>
<ellipse cx="137" cy="251" rx="29" ry="21" fill={`url(#${id}blush)`} stroke="none"/><ellipse cx="226" cy="251" rx="29" ry="21" fill={`url(#${id}blush)`} stroke="none"/>
<g className="bunny-eyes" stroke="#806650" strokeWidth="3"><path d="M141 231q9 8 18-1M204 230q9 8 18-1"/><path d="M142 232l-3 2m81-2l3 2" strokeWidth="1.6"/></g>
<path d="M175 253q7-6 14 0q-3 7-7 7q-4 0-7-7Z" fill="#dca19a" stroke="none"/><path d="M182 260v4m-7 0q3 5 7 0q4 5 8 0" stroke="#ac8c76" strokeWidth="1.5"/>
<path d="M144 249l-1 4m5-4l-1 4m70-4l-1 4m5-4l-1 4" stroke="#e1a39c" strokeWidth="1.3"/>
{/* The papaya cap carries his number, right at the front. */}
<g transform="rotate(-8 183 170)"><path d="M125 178Q122 130 162 119Q208 108 237 141L243 174Q183 183 125 178Z" fill={`url(#${id}cap)`} stroke="#c38a5f"/><path d="M171 120q-8 22-4 48m34-47q12 21 11 47" stroke="#e6a066" strokeWidth="1.6"/><ellipse cx="178" cy="118" rx="5" ry="2.8" fill="#c98e62" stroke="none"/><rect x="168" y="135" width="38" height="31" rx="9" fill="#fff2da" stroke="#d69c6c" strokeWidth="1.3"/><text x="187" y="158" fill="#a36b43" stroke="none" textAnchor="middle" fontFamily="'Nunito',sans-serif" fontSize="25" fontWeight="900">81</text><path d="M122 176Q161 166 209 174Q226 178 211 187Q162 201 119 187Q110 182 122 176Z" fill="#eb985a" stroke="#c38a5f"/><path d="M130 183q36 7 71-1" stroke="#f8bc88" strokeWidth="1.6"/></g>
{/* A small mailbag and a letter pillow, rather than a stiff uniform. */}
<g transform="rotate(9 313 289)"><rect x="286" y="262" width="61" height="51" rx="11" fill="#cda27a" stroke="#b18a64"/><path d="M286 271q31 20 61-1v-7h-61Z" fill="#dfb98f" stroke="#b18a64"/><path d="M314 284v8" stroke="#a77d57" strokeWidth="4"/><path d="M325 264l9-19" stroke="#c19b78" strokeWidth="7"/></g>
<ellipse cx="254" cy="313" rx="30" ry="11" fill="#fff8e9" stroke="#d5bda0"/>
<g className="letter-paw"><g transform="rotate(-7 175 303)"><rect x="112" y="279" width="118" height="52" rx="8" fill="#fffaf0" stroke="#c8ad90"/><path d="M115 283l54 30q6 3 12-1l46-28m-110 43l35-22m73 22l-28-21" stroke="#d3baa0" strokeWidth="1.7"/><path d="M172 298c-7-9-16 0-8 7l10 8 10-10c7-8-4-15-10-5Z" fill="#e5aca8" stroke="none"/></g><path d="M124 279q-5 13 7 19q15 8 28-3q6-5 0-10" fill="#fff7e7" stroke="#ceb496"/><path d="M211 281q15-6 19 5q3 14-13 17q-16 4-20-5q-2-8 7-10" fill="#fff7e7" stroke="#ceb496"/><path d="M137 291l1 4m7-5l1 4m65-1v4m7-6v4" stroke="#e3cdb1" strokeWidth="1.3"/></g>
</g>
<path d="M340 168c-8-12-21-1-12 7l14 12 11-15c8-11-7-18-13-4Z" fill="#e7b2af"/>
<g stroke="#c9b896" strokeWidth="1.5" strokeLinecap="round" opacity=".75"><path d="M65 188l2-4m-13 7l-3-3m17 9l4 1"/><path d="M346 212l2 4m6-9l3-2"/></g>
</svg>}
