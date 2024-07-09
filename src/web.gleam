import gleam/dynamic
import gleam/int
import gleam/io
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/result
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

type GitHubProjectRemoteInfo {
  GitHubProjectRemoteInfo(
    full_name: String,
    stars: Int,
    language: String,
    description: String,
  )
}

type Msg {
  OnRouteChange(Route)
  OnGotGitHubProject(Result(GitHubProjectRemoteInfo, HttpError))
}

type Model {
  Model(route: Route, projects: List(Project))
}

// TODO: Add start and end date
type Project {
  GenericProject(
    name: String,
    desc: String,
    repo_url: String,
    langs: List(String),
    contrib_desc: String,
  )
  GithubProject(
    name: String,
    org: String,
    contrib_desc: String,
    remote_info: Option(GitHubProjectRemoteInfo),
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
  #(
    Model(route, main_projects()),
    main_projects()
      |> list.map(get_project)
      |> list.append([modem.init(on_url_change)])
      |> effect.batch,
  )
}

fn update(model: Model, msg) -> #(Model, Effect(Msg)) {
  case msg {
    OnRouteChange(route) -> #(Model(..model, route: route), case route {
      Projects -> {
        main_projects() |> list.map(get_project) |> effect.batch
      }
      _ -> effect.none()
    })
    OnGotGitHubProject(Ok(remote_project_info)) -> {
      io.debug(remote_project_info)
      let update_project = fn(project: Project) -> Project {
        case project {
          GithubProject(name, org, contrib_desc, _) -> {
            case { org <> "/" <> name == remote_project_info.full_name } {
              True -> {
                GithubProject(
                  name,
                  org,
                  contrib_desc,
                  Some(remote_project_info),
                )
              }
              False -> project
            }
          }
          _ -> project
        }
      }
      #(
        Model(..model, projects: model.projects |> list.map(update_project)),
        effect.none(),
      )
    }
    OnGotGitHubProject(Error(err)) -> {
      io.debug(err)
      #(model, effect.none())
    }
  }
}

fn main_projects() -> List(Project) {
  [
    GithubProject(
      "monocle",
      "change-metrics",
      "I started this project and I'm on of the main contributors of this project. "
        <> "The project has been initially started in Python, then for the fun and "
        <> "with the help of a colleague we migrated the code to Haskell.",
      None,
    ),
    GithubProject(
      "repoxplorer",
      "morucci",
      "I started this project and was the main contribution on it",
      None,
    ),
    GenericProject(
      "Software Factory",
      " This project help us to maintain a development forge with Zuul as the main component for"
        <> " the CI/CD",
      "https://www.softwarefactory-project.io",
      ["Ansible", "Python"],
      "I'm working on this project with my co-workers. It is an infrastucture project and I used to"
        <> " provide improvements on the code base.",
    ),
    GithubProject(
      "sf-operator",
      "softwarefactory-project",
      "I'm currently actively working on that project with the help of my co-workers.",
      None,
    ),
    GenericProject(
      "Zuul CI",
      "This an Opendev's project initialy developed for the OpenStack project CI.",
      "https://opendev.org/zuul/zuul",
      ["Python", "TypeScript"],
      "I've contributed several improvment to Zuul, mainly the Git, Pagure, ElasticSearch and GitLab driver",
    ),
    GithubProject(
      "HazardHunter",
      "web-apps-lab",
      "I'm the main developer of it. Wanted to challenge myself to leverage HTMX via ButlerOS.",
      None,
    ),
    GithubProject(
      "MemoryMaster",
      "web-apps-lab",
      "I'm the main developer of it. A second game after HazardHunter and because this is fun to code.",
      None,
    ),
    GenericProject(
      "FM gateway",
      "",
      "https://pagure.io/fm-gateway",
      ["Python"],
      "",
    ),
  ]
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
  case project {
    GenericProject(_, _, _, _, _) -> effect.none()
    GithubProject(_, _, _, Some(_)) -> {
      io.debug("Already got")
      effect.none()
    }
    GithubProject(name, org, _, None) -> {
      let decoder =
        dynamic.decode4(
          GitHubProjectRemoteInfo,
          dynamic.field("full_name", dynamic.string),
          dynamic.field("stargazers_count", dynamic.int),
          dynamic.field("language", dynamic.string),
          dynamic.field("description", dynamic.string),
        )
      let url = "https://api.github.com/repos/" <> org <> "/" <> name
      lustre_http.get(url, lustre_http.expect_json(decoder, OnGotGitHubProject))
    }
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
  case project {
    GenericProject(name, desc, repo_url, langs, contrib_desc) -> {
      div([], [
        div([class("flex justify-between")], [
          mk_link(repo_url, name),
          div([], [langs |> string.join("/") |> text]),
        ]),
        div([class("grid gap-1")], [
          div([], [text(desc)]),
          div([], [text(contrib_desc)]),
        ]),
      ])
    }
    GithubProject(name, org, contrib_desc, Some(ri)) -> {
      div([], [
        div([class("flex justify-between")], [
          mk_link("https://github.com/" <> org <> "/" <> name, name),
          div([], [ri.language |> text]),
          div([], [ri.stars |> int.to_string |> text]),
        ]),
        div([class("grid gap-1")], [
          div([], [text(ri.description)]),
          div([], [text(contrib_desc)]),
        ]),
      ])
    }
    GithubProject(name, org, contrib_desc, None) -> {
      div([], [
        div([class("flex justify-between")], [
          mk_link("https://github.com/" <> org <> "/" <> name, name),
        ]),
        div([class("grid gap-1")], [div([], [text(contrib_desc)])]),
      ])
    }
  }
}

fn view_projects(model: Model) {
  io.debug(model.projects)
  div([], [
    div([], [mk_page_title("Projects")]),
    div([class("grid gap-2")], [
      div([class("grid gap-1")], [
        h2([class("text-1xl font-bold")], [
          text("I have significant contributions to the following projects"),
        ]),
        div([class("grid gap-2")], model.projects |> list.map(view_project)),
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

fn view(model: Model) {
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
        case model.route {
          Home -> view_home(model)
          Projects -> view_projects(model)
          Articles -> view_articles(model)
        },
      ]),
    ]),
  ])
}
