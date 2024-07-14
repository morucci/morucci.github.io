import lustre/attribute.{class, href}
import lustre/element.{type Element}
import lustre/element/html.{a, div, h1, text}

pub fn mk_page_title(title: String) -> Element(a) {
  // Set the title in a grid and use the grid centering parameter
  div([class("grid pt-2 pb-6 justify-items-center")], [
    h1([class("text-3xl font-bold")], [text(title)]),
  ])
}

pub fn mk_link(link: String, link_text: String) -> Element(a) {
  a([class("text-indigo-500"), href(link)], [text(link_text)])
}
