urls ={
"base": "",
"ports": ""
}

const frame = document.getElementById("gameframe");

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  frame.src = 'https://yoursite.com/games/' + id + '/index.html';