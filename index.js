/**
 * @author Jonathan Malcomb
 * @since 10-08-2020
 * @description Using CloudFlare Worker, created a serverless web application
 * that is similar a link-tree style web application
 */

const linksJSON = [
  { name: 'Twitter', url: 'https://twitter.com/JonMalcomb' },
  { name: 'Github', url: 'https://www.github.com/Voomkin' },
  { name: 'Personal Website', url: 'https://jonathan-wvu.dev' },
]

const links = JSON.stringify(linksJSON, null, 2)
const url = 'https://static-links-page.signalnerve.workers.dev'

/**
 * @class LinkWriter
 * @property links - holds an array of JSON Objects
 * @classdesc his class is called and created during HTMLRewriter, this
 * allows for redefining of the DOM -- specifically allowing me
 * to add new HTML elements to the DOM via the element(element) method
 * which takes in an HTML element from the DOM, and does operations
 * on the element based on it's attributes
 */

class LinkWriter {
  constructor(links) {
    this.links = links
  }

  async element(element) {
    const id = element.getAttribute('id')

    if (element.tagName == 'body')
      element.setAttribute(
        'style',
        'background: #FFFFF0;font-family: Georgia;color: #4A5568',
      )
    if (element.tagName == 'title') element.setInnerContent('Jonathan Malcomb')
    if (id == 'profile') element.setAttribute('style', '')
    if (id == 'name') {
      element.setInnerContent('malcombjonathan@gmail.com')
      element.setAttribute('style', 'color: black; margin-top: 2rem')
    }
    if (id == 'avatar') {
      element.setAttribute(
        'style',
        'background: lightblue; box-shadow: 0 0 6px black',
      )
      element.setAttribute(
        'src',
        'https://jonathan-wvu.dev/assets/me-small.png',
      )
    }
    if (id == 'links') {
      this.links.forEach((obj) => {
        const style =
          'border: 1px solid black; background: black; margin-top: 10px; border-radius: 3px; cursor: pointer; color: white'
        const link = `<a href='${obj.url}' style='${style}'}>${obj.name}</a>`
        element.append(link, { html: true })
      })
    }
    if (id == 'social') {
      element.setAttribute('style', '')
      const svg = `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub icon</title><path d="M12
        .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422
        18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809
        1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176
        0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84
        1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592
        24 12.297c0-6.627-5.373-12-12-12"/></svg>`
      const github = `<a href='https://www.github.com/Voomkin'>${svg}</a>`
      element.append(github, { html: true })
    }
  }
}

/**
 * @param {Request} request - Request from event
 * @description If url path contains '/links' returns a API Response
 * of an array of JSON Objects -- Else, returns a new Static
 * HTML Page that has been mutated by the call to HTMLRewriter, which parses through
 * the document and changes the DOM per LinkWriter's element(element)
 * method implementation
 */

async function handleRequest(request) {
  const urlPath = request.url || ''
  const isLinksPath = urlPath.includes('/links')

  if (isLinksPath) {
    return new Response(links, {
      headers: { 'content-type': 'application/json' },
    })
  } else {
    const urlHeaders = {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
      },
    }
    const response = await fetch(url, urlHeaders)
    return new HTMLRewriter()
      .on('*', new LinkWriter(linksJSON))
      .transform(response)
  }
}

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request))
})
