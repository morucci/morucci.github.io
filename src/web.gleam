import lustre
import lustre/attribute.{class, href, target}
import lustre/element.{type Element, text}
import lustre/element/html.{a, div, h1, p}

pub fn main() {
  let app = lustre.simple(init, update, view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)

  Nil
}

fn init(_flags) {
  0
}

// type Msg

fn update(model, _msg) {
  model
}

fn mk_link(link: String, link_text: String) -> Element(a) {
  a(
    [
      class("text-blue-600 visited:text-purple-600"),
      target("_blank"),
      href(link),
    ],
    [text(link_text)],
  )
}

fn view(_model) {
  // Set flex and ensure the container is centered
  div([class("flex flex-row justify-center")], [
    // Ensure we are not using to full wide size
    div([class("basis-10/12")], [
      div([class("w-full max-w-5xl mx-auto")], [
        div([class("grid pt-2 pb-6 justify-items-center")], [
          h1([class("text-2xl font-bold")], [text("Welcome on my web page")]),
        ]),
        div([class("grid gap-2")], [
          p([], [
            text(
              "My name is Fabien Boucher, I'm currenlty working for Red Hat as a Principal Software Engineer.",
            ),
          ]),
          p([], [
            text(
              "At work, I maintain the production chain CI infrastructure for OSP (the Red Hat OpenStack Platform) and",
            ),
            mk_link("https://www.rdoproject.org", " RDO"),
            text(". "),
            text("My daily duty is maintaining the CI infrastucture based on"),
            mk_link("https://zuul-ci.org/", " Zuul"),
            text(". "),
          ]),
          p([], [
            text("I contribute to"),
            mk_link("/oss-contributions", " various Open Source projects "),
            text("for work and during my free time."),
          ]),
        ]),
      ]),
      // Set the title in a grid and use the grid centering parameter
    ]),
  ])
}
