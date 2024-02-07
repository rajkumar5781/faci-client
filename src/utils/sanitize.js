/**
 * Util to sanitize html and text content from users.
 * Should be used when sending html to server (insertHTML) and when displaying html using v-html
 *
 * @param  html The raw html that must be sanitized
 */
import DOMPurify from 'dompurify'

export default function sanitize(html) {
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target'],
  })
}

/**
 *
 * @param {*} htmlString
 * @returns html content with unescaped html.
 * Ex: Rich text editor usecase: We will unescape html entities which comes as string converting into html tags with attributes
 */
export const santitizeWithUnescapeHTML = htmlString => {
  const rawHtmlString = String(htmlString)
    .replace(/\\n/g, '')
    .replace(/\\/g, '')
    .replace(/^"|"$/g, '')
    .replace('</body>"', '</body>')

  const convertHTMLEntities = content => {
    const entityMap = {
      '&lt;': '<',
      '&gt;': '>',
      '&#x3D;': '=',
      '&quot;': '"',
    }

    // Replace each HTML entity with its corresponding character
    return Object.entries(entityMap).reduce(
      (processedContent, [entity, character]) => {
        return processedContent.replace(new RegExp(entity, 'g'), character)
      },
      content
    )
  }

  const processHTMLTags = htmlString => {
    // Generalized regular expression to match any tag
    const tagRegExp = /<(\w+)(.*?)>(.*?)<\/\1>/g

    // Replace the content within any tag using the generic function
    return htmlString.replace(tagRegExp, (_, tagName, attributes, content) => {
      const processedContent = convertHTMLEntities(content)
      return `<${tagName}${attributes}>${processedContent}</${tagName}>`
    })
  }

  // Handling escaped HTML content within any tag using the generic function
  const processedHTML = processHTMLTags(rawHtmlString)

  // Parsing the HTML string
  const parser = new DOMParser()
  const doc = parser.parseFromString(processedHTML, 'text/html')

  // Sanitizing the HTML string
  const sanitizedHTML = DOMPurify.sanitize(
    new XMLSerializer().serializeToString(doc),
    {
      ADD_ATTR: ['style', 'color', 'size', 'face', 'weight'],
      ADD_TAGS: ['font'],
    }
  )

  return sanitizedHTML
}
