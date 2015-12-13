function readURL(e) {
	if (e.target.files && e.target.files[0]) {
		var reader = new FileReader();

		reader.onload = function (e) {
			var output = document.getElementById('img');
			output.src = reader.result;
		};
		
		reader.readAsDataURL(e.target.files[0]);
	}
}

function drawOnCanvas(loadedImg) {
	var w = document.getElementById('winput');
	var h = document.getElementById('hinput');
	w.value = loadedImg.width;
	h.value = loadedImg.height;
	
	var img = new Image();
	//var loadedImg = document.getElementById('img');

	img.src = loadedImg.src;
	console.log("%o", img);

	//var canvas = document.createElement('canvas');
	var canvas = document.getElementById('canvas');
	canvas.width = img.width;
	canvas.height = img.height;

	var ctx = canvas.getContext('2d');

	ctx.drawImage(img, 0, 0, img.width, img.height);
	console.log(img.width, img.height);
}

function loadTimer() {
	var element = document.getElementById('timerProgress');

	var seconds = new ProgressBar.Circle(element, {
		duration: 200,
		color: "#FCB03C",
		trailColor: "#ddd"
	});

	setInterval(function() {
		var second = new Date().getSeconds();
		seconds.animate(second / 60, function() {
			seconds.setText(second);
		});
	}, 1000);
}

function setupProgressBar() {
	var element = document.getElementById('progressBar');
	element.innerHTML = '';
	var line = new ProgressBar.Line(element, {
		color: '#6FD57F',
		easing: 'linear',
		text: {
			style: {
				color: "#aaa"
			}
		}
	});
	return line;
	//line.animate(1.0);  // Number from 0.0 to 1.0
}

function isNumber(obj) {
	if (obj.toFixed)	//check a method working on numbers is defined
		return true;
	else
		return false;
}

function retargetImage(btn) {
	btn.disabled = true;
	
	var newW = document.getElementById('winput').value;
	var newH = document.getElementById('hinput').value;
	
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	
	var w = canvas.width;
	var h = canvas.height;
		
	if (canvas.width < newW) {
		var img = document.getElementById('img');
		var w = img.width;
		var h = img.height;
		drawOnCanvas(img);
	}
	
	var progressBar = setupProgressBar();
	
	var imgData = ctx.getImageData(0, 0, w, h);
	gradients = computeGradient(imgData.data, w, h);
	drawGradient(ctx, w, h, gradients);

	if (window.Worker) {
		var thread = new Worker("worker.js");
		thread.postMessage([w - newW, w, h, imgData.data]);

		thread.onmessage = function(e) {
			if (isNumber(e.data)) {
				var percentage = e.data / (w - newW);
				progressBar.animate(percentage);
				progressBar.setText(percentage * 100 + "%");
			}
			else {
				progressBar.animate(1);
				progressBar.setText("100%");
				
				console.log("Received");
				console.log("%o", e);
				//newPixels = removeVerticalSeams(1, img.width, img.height, imgData.data);
				newPixels = e.data;
				canvas.width = newW;
				canvas.height = newH;
				ctx = canvas.getContext('2d');
				imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
				//console.log("%o", newPixels.length);
				//console.log("%o", imgData);
				imgData.data.set(newPixels);
				ctx.putImageData(imgData, 0, 0);

				//seamEnergy = computeVerticalSeams(gradients, img.width, img.height);

				//drawVerticalSeams(ctx, img.width, img.height, seamEnergy);
				btn.disabled = false;
			}
		}

		thread.onerror = function(e) {
			console.log('ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message);
		}
	}
	
}