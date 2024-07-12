import gleam/dynamic
import gleam/int
import gleam/io
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string
import gleam/uri.{type Uri}
import lustre
import lustre/attribute.{class, href, src}
import lustre/effect.{type Effect}
import lustre/element.{type Element, none, text}
import lustre/element/html.{a, div, h1, h2, img, nav, p, span}
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

type Ptype {
  Owner
  Work
  Other
}

// TODO: Add start and end date
type Project {
  GenericProject(
    name: String,
    desc: String,
    repo_url: String,
    langs: List(String),
    contrib_desc: String,
    contrib_link: Option(String),
    project_type: Ptype,
  )
  GithubProject(
    name: String,
    org: String,
    contrib_desc: String,
    project_type: Ptype,
    show_changes: Bool,
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
        model.projects |> list.map(get_project) |> effect.batch
      }
      _ -> effect.none()
    })
    OnGotGitHubProject(Ok(remote_project_info)) -> {
      io.debug(remote_project_info)
      let update_project = fn(project: Project) -> Project {
        case project {
          GithubProject(name, org, contrib_desc, owner, show_changes, _) -> {
            case { org <> "/" <> name == remote_project_info.full_name } {
              True -> {
                GithubProject(
                  name,
                  org,
                  contrib_desc,
                  owner,
                  show_changes,
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
      Owner,
      True,
      None,
    ),
    GithubProject(
      "repoxplorer",
      "morucci",
      "I started this project and was the main contribution on it",
      Owner,
      False,
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
      None,
      Work,
    ),
    GithubProject(
      "sf-operator",
      "softwarefactory-project",
      "I'm currently actively working on that project with the help of my co-workers.",
      Work,
      False,
      None,
    ),
    GenericProject(
      "Zuul CI",
      "This an Opendev's project initialy developed for the OpenStack project CI.",
      "https://opendev.org/zuul/zuul",
      ["Python", "TypeScript"],
      "I've contributed several improvment to Zuul, mainly the Git, Pagure, ElasticSearch and GitLab driver",
      Some(
        "https://review.opendev.org/q/project:+zuul/zuul+author:%22Fabien+Boucher%22+status:merged",
      ),
      Work,
    ),
    GithubProject(
      "HazardHunter",
      "web-apps-lab",
      "Wanted to challenge myself to leverage HTMX via ButlerOS.",
      Owner,
      False,
      None,
    ),
    GithubProject(
      "MemoryMaster",
      "web-apps-lab",
      "A second game after HazardHunter and because it was fun to build.",
      Owner,
      False,
      None,
    ),
    GithubProject(
      "FreeSnaky",
      "morucci",
      "A challenge to learn more about Haskell, the Brick engine and capability to have the whole game logic handled server side and the terminal UI to be just a dumb display.",
      Owner,
      False,
      None,
    ),
    GithubProject(
      "schat",
      "morucci",
      "This is a learning project around Haskell and HTMX.",
      Owner,
      False,
      None,
    ),
    GithubProject(
      "bbot",
      "morucci",
      "A little project I've wrote mainly to learn about OCaml.",
      Owner,
      False,
      None,
    ),
    GenericProject(
      "FM gateway",
      "Gateway to send fedora-messaging messages to the Zuul Pagure driver web-hook service.",
      "https://pagure.io/fm-gateway",
      ["Python"],
      "I've build that project to solve an integration issue between Zuul and the Fedora Pagure Forge",
      Some("https://pagure.io/fm-gateway/commits?author=fboucher@redhat.com"),
      Work,
    ),
    GithubProject(
      "pidstat-grapher",
      "morucci",
      "Project I wrote due to a need to plot system processes resources consumption",
      Owner,
      False,
      None,
    ),
    GenericProject(
      "openstack/swift",
      "Openstack Object Storage",
      "https://opendev.org/openstack/swift",
      ["Python"],
      "I've mainly worked on the Quota middleware.",
      Some(
        "https://review.opendev.org/q/project:+openstack/swift+author:%22Fabien%20Boucher%22+status:merged",
      ),
      Work,
    ),
    GenericProject(
      "zuul-distro-jobs",
      "A library of Zuul jobs for RPM packages build/test integrations",
      "https://pagure.io/zuul-distro-jobs",
      ["Ansible"],
      "I've created that project in order to leverage Zuul CI for RPM based distribution CI purpose",
      Some(
        "https://pagure.io/zuul-distro-jobs/commits?author=fboucher@redhat.com",
      ),
      Work,
    ),
    GenericProject(
      "fedora-project-config",
      "The main Zuul job defintion of Fedora Zuul CI",
      "https://pagure.io/fedora-project-config",
      ["Ansible", "Dhall"],
      "I've initialized this project, based on Zuul and zuul-distro-jobs, to provide CI jobs for validating Fedora packaging.",
      Some(
        "https://pagure.io/fedora-project-config/commits?author=fboucher@redhat.com",
      ),
      Work,
    ),
  ]
}

fn mk_link(link: String, link_text: String) -> Element(a) {
  a([class("text-indigo-500"), href(link)], [text(link_text)])
}

fn mk_page_title(title: String) -> Element(a) {
  // Set the title in a grid and use the grid centering parameter
  div([class("grid pt-2 pb-6 justify-items-center")], [
    h1([class("text-3xl font-bold")], [text(title)]),
  ])
}

fn build_full_name(org: String, name: String) -> String {
  org <> "/" <> name
}

fn mk_github_contrib_link(name: String, org: String) {
  "https://github.com/"
  <> org
  <> "/"
  <> name
  <> "/pulls?q=is%3Apr+is%3Aclosed+author%3Amorucci+"
}

fn get_project(project: Project) -> Effect(Msg) {
  case project {
    GenericProject(..) -> effect.none()
    GithubProject(name, org, _, _, _, Some(_)) -> {
      io.debug(
        "remote infos for alreay for "
        <> build_full_name(org, name)
        <> " already in app state",
      )
      effect.none()
    }
    GithubProject(name, org, _, _, _, None) -> {
      io.debug("fetching remote infos for " <> build_full_name(org, name))
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
    div([class("flex flex-col gap-2")], [
      div([class("self-center")], [
        img([
          class("rounded-full w-32 h-32"),
          src("https://avatars.githubusercontent.com/u/84583"),
        ]),
      ]),
      div([class("flex flex-col gap-2")], [
        p([], [
          text(
            "My name is Fabien Boucher, I'm currenlty working for Red Hat as a Principal Software Engineer.",
          ),
          text(
            " At work, I maintain the production chain CI infrastructure for OSP (the Red Hat OpenStack Platform) and for",
          ),
          mk_link("https://www.rdoproject.org", " RDO"),
          text(". I contribute to"),
          mk_link("/projects", " various Open Source projects "),
          text("for work and during my free time."),
        ]),
      ]),
    ]),
  ])
}

fn view_project(project: Project) {
  case project {
    GenericProject(
      name,
      desc,
      repo_url,
      langs,
      contrib_desc,
      contrib_link,
      _ptype,
    ) -> {
      div([], [
        div([class("flex justify-between")], [
          mk_link(repo_url, name),
          div([class("flex flex-row gap-2")], [
            case contrib_link {
              Some(link) -> mk_link(link, "(changes)")
              None -> element.none()
            },
            div([], [langs |> string.join("/") |> text]),
          ]),
        ]),
        div([class("grid gap-1")], [
          div([], [text(desc)]),
          div([], [text(contrib_desc)]),
        ]),
      ])
    }
    GithubProject(name, org, contrib_desc, _, show_changes, Some(ri)) -> {
      div([], [
        div([class("flex justify-between")], [
          div([class("flex gap-1")], [
            mk_link("https://github.com/" <> org <> "/" <> name, name),
          ]),
          div([class("flex flex-row gap-2")], [
            case show_changes {
              True ->
                div([], [
                  mk_link(mk_github_contrib_link(name, org), "(changes)"),
                ])
              False -> element.none()
            },
            div([], [text(ri.stars |> int.to_string <> "⭐")]),
            div([], [text(ri.language)]),
          ]),
        ]),
        div([class("grid gap-1")], [
          div([], [text(ri.description)]),
          div([], [text(contrib_desc)]),
        ]),
      ])
    }
    _ -> element.none()
  }
}

fn view_projects(model: Model) {
  let section_title = fn(title: String) {
    h2([class("text-2xl font-bold text-blue-100")], [text(title)])
  }
  div([], [
    div([], [mk_page_title("Projects")]),
    div([class("grid gap-6")], [
      div([class("grid gap-1")], [
        section_title("Projects I have originaly created"),
        div(
          [class("grid gap-2")],
          model.projects
            |> list.filter(fn(p) {
              case p {
                GithubProject(project_type: Owner, ..) -> True
                GenericProject(project_type: Owner, ..) -> True
                _ -> False
              }
            })
            |> list.map(view_project),
        ),
      ]),
      div([class("grid gap-1")], [
        section_title("Projects I've contributed to for my employer"),
        div(
          [class("grid gap-2")],
          model.projects
            |> list.filter(fn(p) {
              case p {
                GithubProject(project_type: Work, ..) -> True
                GenericProject(project_type: Work, ..) -> True
                _ -> False
              }
            })
            |> list.map(view_project),
        ),
      ]),
      div([class("grid gap-1")], [
        h2([class("text-1xl font-bold")], [
          text("I did some contributions to the following projects"),
        ]),
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
  div(
    [
      class(
        "flex flex-row justify-center min-h-screen bg-zinc-800 text-teal-200",
      ),
    ],
    [
      // Ensure we are not using to full wide size
      div([class("basis-10/12")], [
        div([class("pt-1 w-full max-w-5xl mx-auto")], [
          div([class("p-1 border-2 border-indigo-500 bg-zinc-900")], [
            nav([class("flex gap-2")], [
              mk_link("/", "Home"),
              mk_link("/projects", "Projects"),
              mk_link("/articles", "Articles"),
            ]),
          ]),
          case model.route {
            Home -> view_home(model)
            Projects -> view_projects(model)
            Articles -> view_articles(model)
          },
        ]),
      ]),
    ],
  )
}
