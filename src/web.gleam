import gleam/io
import gleam/uri.{type Uri}
import lustre
import lustre/attribute.{class, href}
import lustre/effect.{type Effect}
import lustre/element.{type Element, text}
import lustre/element/html.{a, div, h1, h2, nav, p}
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

fn uri_to_route(uri: Uri) -> Route {
  case uri.path_segments(uri.path) {
    ["projects"] -> Projects
    _ -> Home
  }
}

fn on_url_change(uri: Uri) -> Msg {
  OnRouteChange(uri_to_route(uri))
}

fn init(_flags) -> #(Model, Effect(Msg)) {
  let route = case modem.initial_uri() {
    Ok(uri) -> uri_to_route(uri)
    Error(_) -> Home
  }
  #(Model(route), modem.init(on_url_change))
}

fn update(_model, msg) -> #(Model, Effect(Msg)) {
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
  div([], [
    div([], [mk_page_title("Projects")]),
    div([class("grid gap-2")], [
      div([class("grid gap-1")], [
        h2([class("text-1xl font-bold")], [
          text("I am one of the main contributors on"),
        ]),
        div([], [text("Monocle")]),
        div([], [text("Zuul")]),
      ]),
      div([class("grid gap-1")], [
        h2([class("text-1xl font-bold")], [text("I did some contributions on")]),
      ]),
    ]),
  ])
}

fn view(model) {
  // Set flex and ensure the container is centered
  div([class("flex flex-row justify-center")], [
    // Ensure we are not using to full wide size
    div([class("basis-10/12")], [
      div([class("w-full max-w-5xl mx-auto")], [
        nav([class("flex gap-2")], [
          mk_link("/", "Home"),
          mk_link("/projects", "Projects"),
        ]),
        case model {
          Model(Home) -> view_home(model)
          Model(Projects) -> view_project(model)
        },
      ]),
    ]),
  ])
}
