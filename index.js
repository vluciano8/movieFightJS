//Call autocomplete to re-use the code from different apis.

const autocompleteConfig = {
	renderOption: (movie) => {
		const imgSrc = movie.Poster === 'N/A' ? '' : movie.Poster;
		return `
		<img src="${imgSrc}"/>
		${movie.Title} (${movie.Year})
	`;
	},

	//Take a movie and after a user click, call input value
	inputValue(movie) {
		return movie.Title;
	},
	async fetchData(searchTerm) {
		const response = await axios.get('http://www.omdbapi.com/', {
			params: {
				apikey: '56ef54ad',
				s: searchTerm
			}
		});

		if (response.data.Error) {
			return [];
		}

		return response.data.Search; //returns only the data we need
	}
};

//Replicate the amount of automplete that need to be used(in this case right and left)
//Left Side
createAutoComplete({
	...autocompleteConfig, // take the props from autocomplete variable
	root: document.querySelector('#left-autocomplete'),
	//The object the user clicked on
	onOptionSelect(movie) {
		document.querySelector('.tutorial').classList.add('is-hidden');
		onMovieSelect(movie, document.querySelector('#left-summary'), 'left');
	}
});
//Right Side
createAutoComplete({
	...autocompleteConfig,
	root: document.querySelector('#right-autocomplete'),
	//The object the user clicked on
	onOptionSelect(movie) {
		document.querySelector('.tutorial').classList.add('is-hidden');
		onMovieSelect(movie, document.querySelector('#right-summary'), 'right');
	}
});

//Define movies variables to compare later
let leftMovie;
let rightMovie;

//Helper created to search for selected movie details
const onMovieSelect = async (movie, summaryElement, side) => {
	const response = await axios.get('http://www.omdbapi.com/', {
		params: {
			apikey: '56ef54ad',
			i: movie.imdbID //this comes from the selected movie index plus api params
		}
	});
	summaryElement.innerHTML = movieTemplate(response.data);
	if (side === 'left') {
		leftMovie = response.data;
	} else {
		rightMovie = response.data;
	}
	//Check if both movies are defined (exists)
	if (leftMovie && rightMovie) {
		runComparison();
	}
};

//Helper created to compare the movies
const runComparison = () => {
	const leftSideStats = document.querySelectorAll('#left-summary .notification');
	const rightSideStats = document.querySelectorAll('#right-summary .notification');

	leftSideStats.forEach((leftStat, index) => {
		const rightStat = rightSideStats[index];

		const leftSideValue = parseInt(leftStat.dataset.value);
		const rightSideValue = parseInt(rightStat.dataset.value);

		if (rightSideValue > leftSideValue) {
			leftStat.classList.remove('is-primary');
			leftStat.classList.add('is-danger');
		} else {
			rightStat.classList.remove('is-primary');
			rightStat.classList.add('is-danger');
		}
	});
};

//Helper created to render movie information with HTML
const movieTemplate = (movieDetail) => {
	//turn properties in a way easy to compare formats
	const dollars = parseInt(movieDetail.BoxOffice.replace(/\$/g, '').replace(/,/g, ''));
	const metascore = parseInt(movieDetail.Metascore);
	const imdbRating = parseFloat(movieDetail.imdbRating);
	const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ''));

	const awards = movieDetail.Awards.split(' ').reduce((prev, word) => {
		const value = parseInt(word);

		if (isNaN(value)) {
			return prev;
		} else {
			return prev + value;
		}
	}, 0);

	return `
    <article class="media">
      <figure class="media-left">
        <p class="image">
          <img src="${movieDetail.Poster}" />
        </p>
      </figure>
      <div class="media-content">
        <div class="content">
          <h1>${movieDetail.Title}</h1>
          <h4>${movieDetail.Genre}</h4>
          <p class="plot">${movieDetail.Plot}</p>
        </div>
      </div>
    </article>
    <article  data-value="${awards}" class="notification is-primary">
      <p class="title">${movieDetail.Awards}</p>
      <p class="subtitle">Awards</p>
    </article>
    <article data-value="${dollars}" class="notification is-primary">
      <p class="title">${movieDetail.BoxOffice}</p>
      <p class="subtitle">Box Office</p>
    </article>
    <article data-value="${metascore}" class="notification is-primary">
      <p class="title">${movieDetail.Metascore}</p>
      <p class="subtitle">Metascore</p>
    </article>
    <article data-value="${imdbRating}" class="notification is-primary">
      <p class="title">${movieDetail.imdbRating}</p>
      <p class="subtitle">IMDB Rating</p>
    </article>
    <article data-value="${imdbVotes}" class="notification is-primary">
      <p class="title">${movieDetail.imdbVotes}</p>
      <p class="subtitle">IMDB Votes</p>
    </article>
  `;
};
