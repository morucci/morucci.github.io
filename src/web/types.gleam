import gleam/option.{type Option}
import lustre_http.{type HttpError}

pub type GitHubProjectRemoteInfo {
  GitHubProjectRemoteInfo(
    full_name: String,
    stars: Int,
    language: String,
    description: Option(String),
  )
}

pub type Route {
  Home
  Projects
  Articles
}

pub type Msg {
  OnRouteChange(Route)
  OnGotGitHubProject(Result(GitHubProjectRemoteInfo, HttpError))
}

pub type Model {
  Model(route: Route, projects: List(Project))
}

pub type Ptype {
  Owner
  Work
  Other
}

pub type Contrib {
  Changes
  Commits
}

// TODO: Add start and end date
pub type Project {
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
    show_contrib: Option(Contrib),
    remote_info: Option(GitHubProjectRemoteInfo),
  )
}
