var url = location.search.substring(1);

PDFJS.cMapUrl = 'https://unpkg.com/pdfjs-dist@1.9.426/cmaps/';
PDFJS.cMapPacked = true;

var pdfDoc = null;

function createPage(num) {
	var div = document.createElement("canvas");
	if(num == 1) {
		div.style.marginTop = '44px';
	}
	document.body.appendChild(div);
	return div;
}

function renderPage(num) {
	pdfDoc.getPage(num).then(function(page) {
		var viewport = page.getViewport(2.0);
		var canvas = createPage(num);
		var ctx = canvas.getContext('2d');

		canvas.height = viewport.height;
		canvas.width = viewport.width;

		page.render({
			canvasContext: ctx,
			viewport: viewport
		});
	});
}

PDFJS.getDocument(url).then(function(pdf) {
	events.closeWaiting();
	pdfDoc = pdf;
	for(var i = 1; i <= pdfDoc.numPages; i++) {
		renderPage(i)
	}
});