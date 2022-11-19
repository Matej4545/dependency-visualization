import { CreateComponents, CreateProject, DeleteAllData, UpdateComponentDependencies } from "./DbDataHelper";

export async function ImportSbom(bom: any) {
    // Prepare project
    const project = {
        name: bom.metadata.component.name,
        version: bom.metadata.component.version || 1,
        date: bom.metadata.timestamp || '1970-01-01',
    };
    
    // Prepare components
    let components = GetComponents(bom);
    
    // Prepare dependencies
    let dependencies = GetDependencies(bom.dependencies.dependency);
    
    // Currently there is no support for managing older projects - we first need to clear the DB
    await DeleteAllData();
    // Create all objects in DB
    await CreateProject(project);
    await CreateComponents(components);
    await UpdateComponentDependencies(dependencies);
    return {status: 'It is done!', components_count: components.length(), dependencies_count: dependencies.length()}
}
function GetComponents(bom: any) {
    let components = bom.components.component
    if (bom.metadata.component) {
        components.push(bom.metadata.component);
    }
    // Component data transformation
    components = components.map((c) => {
        return {
            purl: c.purl,
            name: c.name,
            version: c.version,
            author: c.author,
            type: c.type,
        };
    });
    return components
}

function GetDependencies(dependencies: any) {
  if (!dependencies) return;
  const res = dependencies
    .map((d) => {
      if (d.dependency != undefined) {
        if (!(d.dependency instanceof Array)) d.dependency = [d.dependency];
        return {
          purl: d.ref,
          dependsOn: d.dependency.map((d) => {
            return { purl: d.ref };
          }),
        };
      }
    })
    .filter((d) => {
      return d != undefined;
    });
  return res;
}