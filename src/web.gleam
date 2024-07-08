import gleam/dynamic
import gleam/io
import gleam/list
import gleam/string
import gleam/uri.{type Uri}
import lustre
import lustre/attribute.{class, href}
import lustre/effect.{type Effect}
import lustre/element.{type Element, text}
import lustre/element/html.{a, div, h1, h2, nav, p}
import lustre_http.{type HttpError}
import modem

type Route {
  Home
  Projects
  Articles
}

type GitHubProject {
  GitHubProject(stars: Int)
}

type Msg {
  OnRouteChange(Route)
  GitHubProjectGotStars(Result(GitHubProject, HttpError))
}

type Model {
  Model(route: Route)
}

type Ptype {
  GitHub(org: String, name: String)
  SF
  Opendev
  Pagure
}

// TODO: Add start and end date
type Project {
  Project(
    name: String,
    ptype: Ptype,
    desc: String,
    repo_url: String,
    langs: List(String),
    contrib_desc: String,
  )
}

pub fn main() {
  let app = lustre.application(init, update, view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)
  Nil
}

fn uri_to_route(uri: Uri) -> Route {
  case uri.path_segments(uri.path) {
    ["projects"] -> Projects
    ["articles"] -> Articles
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

fn update(model, msg) -> #(Model, Effect(Msg)) {
  case msg {
    OnRouteChange(route) -> #(Model(route), effect.none())
    _ -> #(model, effect.none())
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

fn get_project(project: Project) -> Effect(Msg) {
  let get_github_project = fn(org: String, name: String) {
    let decoder =
      dynamic.decode1(
        GitHubProject,
        dynamic.field("stargazers_count", dynamic.int),
      )
    let url = "https://api.github.com/repos/" <> org <> "/" <> name
    lustre_http.get(
      url,
      lustre_http.expect_json(decoder, GitHubProjectGotStars),
    )
  }
  case project.ptype {
    GitHub(org, name) -> get_github_project(org, name)
    _ -> effect.none()
  }
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

fn view_project(project: Project) {
  div([], [
    div([class("flex justify-between")], [
      mk_link(project.repo_url, project.name),
      div([], [project.langs |> string.join("/") |> text]),
    ]),
    div([class("grid gap-1")], [
      div([], [text(project.desc)]),
      div([], [text(project.contrib_desc)]),
    ]),
  ])
}

fn view_projects(_model) {
  let main_projects = [
    Project(
      "Monocle",
      GitHub("change-metrics", "Monocle"),
      "Monocle is capable of indexing Pull-Requests, Merge-Requests and "
        <> "Gerrit reviews in order to provide development statistics and developer dashboards",
      "https://github.com/change-metrics/monocle",
      ["Haskell", "ReScript"],
      "I started this project and I'm on of the main contributors of this project. "
        <> "The project has been initially started in Python, then for the fun and "
        <> "with the help of a colleague we migrated the code to Haskell.",
    ),
    Project(
      "RepoXplorer",
      GitHub("morucci", "repoxplorer"),
      "Monocle provides statistics on Git repositories.",
      "https://github.com/morucci/repoxplorer",
      ["Python", "JavaScript"],
      "I started this project and was the main contribution on it",
    ),
    Project(
      "Software Factory",
      SF,
      " This project help us to maintain a development forge with Zuul as the main component for"
        <> " the CI/CD",
      "https://www.softwarefactory-project.io",
      ["Ansible", "Python"],
      "I'm working on this project with my co-workers. It is an infrastucture project and I used to"
        <> " provide improvements on the code base.",
    ),
    Project(
      "SF Operator",
      GitHub("software-factory", "sf-operator"),
      "This is an evolution of Software Factory made to be deployed"
        <> " on OpenShift or Vanilla Kubernetes. This k8s operator manages a"
        <> " Resource called Software Factory capable of deploying a CI/CD system based on Zuul",
      "https://github.com/softwarefactory-project/sf-operator",
      ["GO"],
      "I'm currently actively working on that project with the help of my co-workers.",
    ),
    Project(
      "Zuul CI",
      Opendev,
      "This an Opendev's project initialy developed for the OpenStack project CI.",
      "https://opendev.org/zuul/zuul",
      ["Python", "TypeScript"],
      "I've contributed several improvment to Zuul, mainly the Git, Pagure, ElasticSearch and GitLab driver",
    ),
    Project(
      "HazardHunter",
      GitHub("web-apps-lab", "HazardHunter"),
      "This is a MineSweeper like game.",
      "https://github.com/web-apps-lab/HazardHunter",
      ["Haskell", "HTMX"],
      "I'm the main developer of it. Wanted to challenge myself to leverage HTMX via ButlerOS.",
    ),
    Project(
      "MemoryMaster",
      GitHub("web-apps-lab", "MemoryMaster"),
      "Memory Master is a Concentration card game.",
      "https://github.com/web-apps-lab/MemoryMaster",
      ["Haskell", "HTMX"],
      "I'm the main developer of it. A second game after HazardHunter and because this is fun to code.",
    ),
    Project(
      "FM gateway",
      Pagure,
      "",
      "https://pagure.io/fm-gateway",
      ["Python"],
      "",
    ),
  ]
  div([], [
    div([], [mk_page_title("Projects")]),
    div([class("grid gap-2")], [
      div([class("grid gap-1")], [
        h2([class("text-1xl font-bold")], [
          text("I have significant contributions to the following projects"),
        ]),
        div([class("grid gap-2")], main_projects |> list.map(view_project)),
      ]),
      div([class("grid gap-1")], [
        h2([class("text-1xl font-bold")], [
          text("I did some contributions to the following projects"),
        ]),
        div([], [text("OpenStack Swift")]),
        div([], [text("Dulwich")]),
        div([], [text("ButlerOS")]),
      ]),
    ]),
  ])
}

fn view_articles(_model) {
  div([], [text("articles")])
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
          mk_link("/articles", "Articles"),
        ]),
        case model {
          Model(Home) -> view_home(model)
          Model(Projects) -> view_projects(model)
          Model(Articles) -> view_articles(model)
        },
      ]),
    ]),
  ])
}
