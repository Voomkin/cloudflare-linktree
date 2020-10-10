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

class BodyWriter {
  async element(element) {
    element.setAttribute('style', 'font-family: Monospace')
    element.setAttribute('class', 'bg-blue-700')
  }
}

class TitleWriter {
  async element(element) {
    element.setInnerContent('Jonathan Malcomb')
  }
}

class ProfileWriter {
  async element(element) {
    element.removeAttribute('style')
  }
}

class NameWriter {
  async element(element) {
    element.setInnerContent('malcombjonathan@gmail.com')
    element.setAttribute(
      'style',
      'color: black; margin-top: 2rem; font-size: 1.1rem',
    )
  }
}

class AvatarWriter {
  async element(element) {
    element.setAttribute(
      'style',
      'background: white; box-shadow: 0 0 6px black',
    )
    element.setAttribute('src', 'https://jonathan-wvu.dev/assets/me-small.png')
  }
}

class LinkWriter {
  async element(element) {
    linksJSON.forEach(obj => {
      const style = 'box-shadow: 0 0 10px black'
      const link = `<a href='${obj.url}' style='${style}'}>${obj.name}</a>`
      element.append(link, { html: true })
    })
  }
}

class SocialWriter {
  async element(element) {
    element.removeAttribute('style')
    const svg = `<img src='https://www.flaticon.com/svg/static/icons/svg/25/25231.svg' alt='Github'>`
    const github = `<a href='https://www.github.com/Voomkin'>${svg}</a>`
    element.append(github, { html: true })
  }
}

/**
 * @param {Request} request - Request from event
 * @description If url path ends in '/links' then returns a API Response
 * of an array of JSON Objects -- Else, returns a new Static
 * HTML Page that has been mutated by the call to HTMLRewriter, which parses through
 * the document and changes the specific HTML element per class implementation that 
 * corresponds to them
 */

async function handleRequest(request) {
  const isLinks = request.url.endsWith('/links')

  if (isLinks) {
    return new Response(links, {
      headers: { 'content-type': 'application/json' },
    })
  } else {
    const headers = {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
      },
    }
    const response = await fetch(url, headers)
    return new HTMLRewriter()
      .on('body', new BodyWriter())
      .on('div#links', new LinkWriter())
      .on('div#profile', new ProfileWriter())
      .on('img#avatar', new AvatarWriter())
      .on('h1#name', new NameWriter())
      .on('div#social', new SocialWriter())
      .on('title', new TitleWriter())
      .transform(response)
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
