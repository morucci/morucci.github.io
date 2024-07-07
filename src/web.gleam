import gleam/io
import gleam/uri.{type Uri}
import lustre
import lustre/attribute.{class, href, target}
import lustre/effect.{type Effect}
import lustre/element.{type Element, text}
import lustre/element/html.{a, div, h1, nav, p}
import modem

type Route {
  Home
  Projects
}

type Msg {
  OnRouteChange(Route)
}

type Model {
  Model(route: Route)
}

pub fn main() {
  let app = lustre.application(init, update, view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)
  Nil
}

fn on_url_change(uri: Uri) -> Msg {
  io.debug(uri)
  case uri.path_segments(uri.path) {
    ["projects"] -> OnRouteChange(Projects)
    _ -> OnRouteChange(Home)
  }
}

fn init(_flags) -> #(Model, Effect(Msg)) {
  #(Model(Home), modem.init(on_url_change))
}

fn update(_model, msg) -> #(Model, Effect(Msg)) {
  io.debug(msg)
  case msg {
    OnRouteChange(route) -> #(Model(route), effect.none())
  }
}

fn mk_link(link: String, link_text: String) -> Element(a) {
  a([class("text-blue-600 visited:text-purple-600"), href(link)], [
    text(link_text),
  ])
}

fn mk_page_title(title: String) -> Element(a) {
  // Set the title in a grid and use the grid centering parameter
  div([class("grid pt-2 pb-6 justify-items-center")], [
    h1([class("text-2xl font-bold")], [text(title)]),
  ])
}

fn view_home(_model) {
  div([], [
    mk_page_title("Welcome on my web page"),
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
        mk_link("/projects", " various Open Source projects "),
        text("for work and during my free time."),
      ]),
    ]),
  ])
}

fn view_project(_model) {
  div([], [mk_page_title("Projects")])
}

fn view(model) {
  // Set flex and ensure the container is centered
  div([class("flex flex-row justify-center")], [
    // Ensure we are not using to full wide size
    div([class("basis-10/12")], [
      nav([class("flex gap-2")], [
        mk_link("/", "Home"),
        mk_link("/projects", "Projects"),
      ]),
      div([class("w-full max-w-5xl mx-auto")], [
        case model {
          Model(Home) -> view_home(model)
          Model(Projects) -> view_project(model)
        },
      ]),
    ]),
  ])
}
